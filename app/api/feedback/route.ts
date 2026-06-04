import { NextRequest, NextResponse } from "next/server";

import { sendNotificationEmail } from "@/lib/notification-email";
import { createNotification } from "@/lib/notifications";
import { getContactFormAvailability } from "@/lib/public-form-availability";
import { checkPersistentRateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/session";

type FeedbackKind = "BUG" | "SUGGESTION";

type FeedbackPayload = {
  kind?: string;
  message?: string;
  page?: string;
  name?: string;
  email?: string;
  website?: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 4;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isFeedbackKind(value: unknown): value is FeedbackKind {
  return value === "BUG" || value === "SUGGESTION";
}

function isValidEmail(email: string) {
  return emailPattern.test(email);
}

function cleanPage(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value.slice(0, 500);
  }

  return value.startsWith("/") ? value.slice(0, 500) : "/";
}

function buildFeedbackText(input: {
  kind: FeedbackKind;
  message: string;
  page: string;
  name: string;
  email: string;
  user?: { name?: string | null; email?: string | null } | null;
}) {
  return [
    `Type: ${input.kind === "BUG" ? "Bug" : "Suggestion"}`,
    `Page: ${input.page}`,
    input.name ? `Nom saisi: ${input.name}` : null,
    input.email ? `Email saisi: ${input.email}` : null,
    input.user?.name || input.user?.email
      ? `Utilisateur connecte: ${input.user.name ?? "Sans nom"} (${input.user.email ?? "email inconnu"})`
      : null,
    "",
    "Message:",
    input.message,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

async function sendWithResend(input: {
  kind: FeedbackKind;
  message: string;
  page: string;
  name: string;
  email: string;
  user?: { name?: string | null; email?: string | null } | null;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!resendApiKey || !to) {
    return false;
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "CCTT <contact@mail.cctt.fr>";
  const replyTo = input.email || input.user?.email || undefined;
  const label = input.kind === "BUG" ? "Bug" : "Suggestion";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `[Feedback ${label}] ${input.page}`,
      ...(replyTo ? { reply_to: replyTo } : {}),
      text: buildFeedbackText(input),
    }),
  });

  return response.ok;
}

async function sendWithWebhook(input: {
  kind: FeedbackKind;
  message: string;
  page: string;
  name: string;
  email: string;
  user?: { name?: string | null; email?: string | null } | null;
}) {
  const webhookUrl =
    process.env.FEEDBACK_WEBHOOK_URL ?? process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      source: "cctt-feedback-form",
      sentAt: new Date().toISOString(),
    }),
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  const availability = getContactFormAvailability();

  if (!availability.isAvailable) {
    return NextResponse.json(
      {
        message:
          "Le formulaire n'est pas disponible pour le moment. Merci d'ecrire directement a communication@cctt.fr.",
      },
      { status: 503 },
    );
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (
    !(await checkPersistentRateLimit({
      bucketId: `feedback:${clientIp}`,
      maxRequests: MAX_REQUESTS,
      windowMs: WINDOW_MS,
    }))
  ) {
    return NextResponse.json(
      {
        message:
          "Trop de tentatives depuis votre adresse IP. Merci de reessayer dans quelques minutes.",
      },
      { status: 429 },
    );
  }

  let payload: FeedbackPayload;

  try {
    payload = (await request.json()) as FeedbackPayload;
  } catch {
    return NextResponse.json({ message: "Requete invalide." }, { status: 400 });
  }

  const kind = isFeedbackKind(payload.kind) ? payload.kind : "BUG";
  const message = payload.message?.trim() ?? "";
  const page = cleanPage(payload.page?.trim() ?? "/");
  const name = payload.name?.trim().slice(0, 100) ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  const website = payload.website?.trim() ?? "";

  if (website.length > 0) {
    return NextResponse.json(
      { message: "Merci, votre retour a bien été envoyé." },
      { status: 200 },
    );
  }

  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { message: "Le message doit contenir entre 10 et 2000 caracteres." },
      { status: 400 },
    );
  }

  if (email && (!isValidEmail(email) || email.length > 150)) {
    return NextResponse.json(
      { message: "Adresse email invalide." },
      { status: 400 },
    );
  }

  const session = await getCurrentSession(request);
  const normalized = {
    kind,
    message,
    page,
    name,
    email,
    user: session?.user
      ? { name: session.user.name, email: session.user.email }
      : null,
  };
  const label = kind === "BUG" ? "Bug" : "Suggestion";
  const title = `${label} signale depuis le site`;
  const content = buildFeedbackText(normalized);

  const notification = await createNotification({
    type: "SYSTEM",
    title,
    content,
    href: page.startsWith("/") ? page : "/admin",
    priority: kind === "BUG" ? "HIGH" : "NORMAL",
    audience: "ADMIN_ONLY",
    sourceKind: "MANUAL",
  });

  const sent =
    (await sendWithWebhook(normalized)) ||
    (await sendWithResend(normalized));

  if (!sent && notification) {
    await sendNotificationEmail(notification);
  }

  if (!sent && !notification) {
    return NextResponse.json(
      {
        message:
          "Le service est temporairement indisponible. Merci d'ecrire directement a communication@cctt.fr.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { message: "Merci, votre retour a bien été envoyé." },
    { status: 200 },
  );
}
