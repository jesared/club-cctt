import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requestTracker = new Map<string, number[]>();

function checkRateLimit(clientIp: string) {
  const now = Date.now();
  const timestamps = requestTracker.get(clientIp) ?? [];
  const validTimestamps = timestamps.filter((time) => now - time < WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS) {
    requestTracker.set(clientIp, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  requestTracker.set(clientIp, validTimestamps);
  return true;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendWithResend(payload: Required<Omit<ContactPayload, "website">>) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!resendApiKey || !to) {
    return false;
  }

  const from = process.env.CONTACT_FROM_EMAIL ?? "Contact CCTT <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Nouveau message contact: ${payload.name}`,
      reply_to: payload.email,
      text: `Nom: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`,
    }),
  });

  return response.ok;
}

async function sendWithWebhook(payload: Required<Omit<ContactPayload, "website">>) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      source: "cctt-contact-form",
      sentAt: new Date().toISOString(),
    }),
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        message:
          "Trop de tentatives depuis votre adresse IP. Merci de réessayer dans quelques minutes.",
      },
      { status: 429 }
    );
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const message = payload.message?.trim() ?? "";
  const website = payload.website?.trim() ?? "";

  if (website.length > 0) {
    return NextResponse.json(
      { message: "Votre message a bien été envoyé." },
      { status: 200 }
    );
  }

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { message: "Le nom doit contenir entre 2 et 100 caractères." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email) || email.length > 150) {
    return NextResponse.json(
      { message: "Adresse email invalide." },
      { status: 400 }
    );
  }

  if (message.length < 10 || message.length > 5000) {
    return NextResponse.json(
      { message: "Le message doit contenir entre 10 et 5000 caractères." },
      { status: 400 }
    );
  }

  const normalizedPayload = { name, email, message };

  const sent =
    (await sendWithWebhook(normalizedPayload)) ||
    (await sendWithResend(normalizedPayload));

  if (!sent) {
    console.error("Contact form is not configured: missing webhook or email provider");
    return NextResponse.json(
      {
        message:
          "Le service de contact est temporairement indisponible. Merci d'écrire directement à communication@cctt.fr.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { message: "Merci, votre message a bien été envoyé." },
    { status: 200 }
  );
}
