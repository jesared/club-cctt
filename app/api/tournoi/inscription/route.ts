import { NextRequest, NextResponse } from "next/server";

type RegistrationPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  ranking?: string;
  club?: string;
  tables?: unknown;
  notes?: string;
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

function normalizeTables(tables: unknown) {
  if (!Array.isArray(tables)) {
    return [];
  }

  return tables
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toUpperCase())
    .filter((value, index, current) => value.length > 0 && current.indexOf(value) === index)
    .slice(0, 6);
}

async function sendWithWebhook(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  ranking: string;
  club: string;
  tables: string[];
  notes: string;
}) {
  const webhookUrl = process.env.TOURNAMENT_REGISTRATION_WEBHOOK_URL;

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
      source: "cctt-tournament-registration-form",
      sentAt: new Date().toISOString(),
    }),
  });

  return response.ok;
}

async function sendWithResend(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  ranking: string;
  club: string;
  tables: string[];
  notes: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.TOURNAMENT_REGISTRATION_TO_EMAIL;

  if (!resendApiKey || !to) {
    return false;
  }

  const from =
    process.env.TOURNAMENT_REGISTRATION_FROM_EMAIL ??
    "Inscriptions tournoi CCTT <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Inscription tournoi: ${payload.firstName} ${payload.lastName}`,
      reply_to: payload.email,
      text: [
        `Nom: ${payload.lastName}`,
        `Prénom: ${payload.firstName}`,
        `Email: ${payload.email}`,
        `Téléphone: ${payload.phone}`,
        `N° licence: ${payload.licenseNumber}`,
        `Classement: ${payload.ranking || "Non renseigné"}`,
        `Club: ${payload.club}`,
        `Tableaux: ${payload.tables.join(", ")}`,
        "",
        `Remarques: ${payload.notes || "Aucune"}`,
      ].join("\n"),
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

  let body: RegistrationPayload;

  try {
    body = (await request.json()) as RegistrationPayload;
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const licenseNumber = body.licenseNumber?.trim() ?? "";
  const ranking = body.ranking?.trim() ?? "";
  const club = body.club?.trim() ?? "";
  const notes = body.notes?.trim() ?? "";
  const website = body.website?.trim() ?? "";
  const tables = normalizeTables(body.tables);

  if (website.length > 0) {
    return NextResponse.json(
      {
        message: "Votre demande d'inscription a bien été prise en compte.",
      },
      { status: 200 }
    );
  }

  if (firstName.length < 2 || firstName.length > 100) {
    return NextResponse.json(
      { message: "Le prénom doit contenir entre 2 et 100 caractères." },
      { status: 400 }
    );
  }

  if (lastName.length < 2 || lastName.length > 100) {
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

  if (phone.length < 10 || phone.length > 20) {
    return NextResponse.json(
      { message: "Le numéro de téléphone doit contenir entre 10 et 20 caractères." },
      { status: 400 }
    );
  }

  if (licenseNumber.length < 6 || licenseNumber.length > 20) {
    return NextResponse.json(
      { message: "Le numéro de licence doit contenir entre 6 et 20 caractères." },
      { status: 400 }
    );
  }

  if (club.length < 2 || club.length > 120) {
    return NextResponse.json(
      { message: "Le nom du club doit contenir entre 2 et 120 caractères." },
      { status: 400 }
    );
  }

  if (tables.length === 0) {
    return NextResponse.json(
      { message: "Merci de sélectionner au moins un tableau." },
      { status: 400 }
    );
  }

  if (notes.length > 1000) {
    return NextResponse.json(
      { message: "Les remarques ne doivent pas dépasser 1000 caractères." },
      { status: 400 }
    );
  }

  const normalizedPayload = {
    firstName,
    lastName,
    email,
    phone,
    licenseNumber,
    ranking,
    club,
    tables,
    notes,
  };

  const sent =
    (await sendWithWebhook(normalizedPayload)) ||
    (await sendWithResend(normalizedPayload));

  if (!sent) {
    console.error(
      "Tournament registration form is not configured: missing webhook or email provider",
      {
        email,
        licenseNumber,
      }
    );

    return NextResponse.json(
      {
        message:
          "Inscription reçue. Le service de notification est en maintenance: contactez inscriptions-tournoi@cctt.fr si vous ne recevez pas de confirmation sous 48h.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      message:
        "Inscription envoyée avec succès. Vous recevrez un email de confirmation après validation.",
    },
    { status: 200 }
  );
}
