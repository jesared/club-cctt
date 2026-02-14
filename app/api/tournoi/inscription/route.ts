import { NextRequest, NextResponse } from "next/server";

type RegistrationPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  points?: string;
  gender?: string;
  club?: string;
  tables?: unknown;
  website?: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requestTracker = new Map<string, number[]>();


const TABLE_RULES: Record<string, { minPoints: number | null; maxPoints: number | null; womenOnly?: boolean }> = {
  C: { minPoints: 800, maxPoints: 1399 },
  A: { minPoints: 500, maxPoints: 799 },
  D: { minPoints: 1100, maxPoints: 1699 },
  B: { minPoints: 500, maxPoints: 1099 },
  F: { minPoints: 500, maxPoints: 1199 },
  H: { minPoints: 1200, maxPoints: 1799 },
  E: { minPoints: 500, maxPoints: 899 },
  G: { minPoints: 900, maxPoints: 1499 },
  I: { minPoints: 500, maxPoints: null },
  J: { minPoints: null, maxPoints: null, womenOnly: true },
  L: { minPoints: 500, maxPoints: 1299 },
  N: { minPoints: 1300, maxPoints: 2099 },
  K: { minPoints: 500, maxPoints: 999 },
  M: { minPoints: 1000, maxPoints: 1599 },
  P: { minPoints: null, maxPoints: null },
};

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

function isTableEligible(tableCode: string, points: number, gender: string) {
  const rule = TABLE_RULES[tableCode];
  if (!rule) {
    return false;
  }

  if (rule.womenOnly && gender !== "F") {
    return false;
  }

  if (rule.minPoints !== null && points < rule.minPoints) {
    return false;
  }

  if (rule.maxPoints !== null && points > rule.maxPoints) {
    return false;
  }

  return true;
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
  points: string;
  gender: string;
  club: string;
  tables: string[];
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
  points: string;
  gender: string;
  club: string;
  tables: string[];
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
        `Points: ${payload.points || "Non renseigné"}`,
        `Genre: ${payload.gender || "Non renseigné"}`,
        `Club: ${payload.club}`,
        `Tableaux: ${payload.tables.join(", ")}`,
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
  const points = body.points?.trim() ?? "";
  const gender = body.gender?.trim().toUpperCase() ?? "";
  const club = body.club?.trim() ?? "";
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


  if (!/^\d{1,5}$/.test(points)) {
    return NextResponse.json(
      { message: "Les points doivent être un nombre positif." },
      { status: 400 }
    );
  }

  if (!["M", "F"].includes(gender)) {
    return NextResponse.json(
      { message: "Le genre doit être M ou F." },
      { status: 400 }
    );
  }

  if (tables.length === 0) {
    return NextResponse.json(
      { message: "Merci de sélectionner au moins un tableau." },
      { status: 400 }
    );
  }

  const numericPoints = Number.parseInt(points, 10);
  const invalidTables = tables.filter((tableCode) => !isTableEligible(tableCode, numericPoints, gender));

  if (invalidTables.length > 0) {
    return NextResponse.json(
      {
        message: `Les tableaux suivants ne sont pas accessibles avec votre profil: ${invalidTables.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const normalizedPayload = {
    firstName,
    lastName,
    email,
    phone,
    licenseNumber,
    points,
    gender,
    club,
    tables,
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
