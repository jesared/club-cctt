import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { RegistrationSource, type Role } from "@prisma/client";

export type RegistrationPayload = {
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

export type NormalizedRegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  points: string;
  pointsNumber: number;
  gender: string;
  club: string;
  tables: string[];
  website: string;
};

type ValidationResult =
  | { ok: true; payload: NormalizedRegistrationPayload }
  | { ok: false; message: string };

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

export async function checkRateLimit(clientIp: string) {
  const now = new Date();
  const bucketId = `tournoi:${clientIp}`;

  const bucket = await withPrismaRetry(() =>
    prisma.rateLimitBucket.findUnique({
      where: { id: bucketId },
    }),
  );

  if (!bucket) {
    await withPrismaRetry(() =>
      prisma.rateLimitBucket.create({
        data: {
          id: bucketId,
          count: 1,
          windowStart: now,
        },
      }),
    );
    return true;
  }

  const windowStart = bucket.windowStart;
  const windowExpires = new Date(windowStart.getTime() + WINDOW_MS);

  if (now > windowExpires) {
    await withPrismaRetry(() =>
      prisma.rateLimitBucket.update({
        where: { id: bucketId },
        data: { count: 1, windowStart: now },
      }),
    );
    return true;
  }

  if (bucket.count >= MAX_REQUESTS) {
    return false;
  }

  await withPrismaRetry(() =>
    prisma.rateLimitBucket.update({
      where: { id: bucketId },
      data: { count: bucket.count + 1 },
    }),
  );

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
    .filter(
      (value, index, current) =>
        value.length > 0 && current.indexOf(value) === index,
    )
    .slice(0, 6);
}

export function validateAndNormalizeRegistration(
  body: RegistrationPayload,
): ValidationResult {
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

  if (firstName.length < 2 || firstName.length > 100) {
    return {
      ok: false,
      message: "Le prénom doit contenir entre 2 et 100 caractères.",
    };
  }

  if (lastName.length < 2 || lastName.length > 100) {
    return {
      ok: false,
      message: "Le nom doit contenir entre 2 et 100 caractères.",
    };
  }

  if (!isValidEmail(email) || email.length > 150) {
    return { ok: false, message: "Adresse email invalide." };
  }

  if (phone.length < 10 || phone.length > 20) {
    return {
      ok: false,
      message:
        "Le numéro de téléphone doit contenir entre 10 et 20 caractères.",
    };
  }

  if (licenseNumber.length < 6 || licenseNumber.length > 20) {
    return {
      ok: false,
      message: "Le numéro de licence doit contenir entre 6 et 20 caractères.",
    };
  }

  if (club.length < 2 || club.length > 120) {
    return {
      ok: false,
      message: "Le nom du club doit contenir entre 2 et 120 caractères.",
    };
  }

  if (!/^\d{1,5}$/.test(points)) {
    return {
      ok: false,
      message: "Les points doivent être un nombre positif.",
    };
  }

  if (!["M", "F"].includes(gender)) {
    return { ok: false, message: "Le genre doit être M ou F." };
  }

  if (tables.length === 0) {
    return {
      ok: false,
      message: "Merci de sélectionner au moins un tableau.",
    };
  }

  const pointsNumber = Number.parseInt(points, 10);

  return {
    ok: true,
    payload: {
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      points,
      pointsNumber,
      gender,
      club,
      tables,
      website,
    },
  };
}

export async function sendRegistrationNotifications(
  payload: NormalizedRegistrationPayload,
) {
  const sentWithWebhook = await sendWithWebhook(payload);
  if (sentWithWebhook) {
    return true;
  }

  return sendWithResend(payload);
}

async function sendWithWebhook(payload: NormalizedRegistrationPayload) {
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

async function sendWithResend(payload: NormalizedRegistrationPayload) {
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

export async function ensureWebRegistrationOwnerId() {
  const user = await withPrismaRetry(() =>
    prisma.user.upsert({
      where: { email: "inscriptions-web@cctt.local" },
      update: {},
      create: {
        email: "inscriptions-web@cctt.local",
        name: "Inscriptions Web CCTT",
        role: "ADMIN" as Role,
      },
      select: { id: true },
    }),
  );

  return user.id;
}

export async function getLatestTournamentId() {
  const tournament = await withPrismaRetry(() =>
    prisma.tournament.findFirst({
      where: {
        status: {
          in: ["PUBLISHED"],
        },
      },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
      },
    }),
  );

  return tournament?.id ?? null;
}

export async function getSelectedEvents(
  tournamentId: string,
  tables: string[],
) {
  return withPrismaRetry(() =>
    prisma.tournamentEvent.findMany({
      where: {
        tournamentId,
        code: {
          in: tables,
        },
        status: {
          in: ["OPEN", "FULL"],
        },
      },
      select: {
        id: true,
        code: true,
        gender: true,
        minPoints: true,
        maxPoints: true,
      },
    }),
  );
}

export function getInvalidTables(
  selectedEvents: Array<{
    code: string;
    gender: string | null;
    minPoints: number | null;
    maxPoints: number | null;
  }>,
  payload: NormalizedRegistrationPayload,
) {
  return selectedEvents
    .filter((event) => {
      if (event.gender === "F" && payload.gender !== "F") {
        return true;
      }

      if (event.gender === "M" && payload.gender !== "M") {
        return true;
      }

      if (event.minPoints !== null && payload.pointsNumber < event.minPoints) {
        return true;
      }

      if (event.maxPoints !== null && payload.pointsNumber > event.maxPoints) {
        return true;
      }

      return false;
    })
    .map((event) => event.code);
}

export async function resolvePlayerRefId({
  existingPlayerId,
  payload,
  ownerId,
}: {
  existingPlayerId: string | null;
  payload: NormalizedRegistrationPayload;
  ownerId: string;
}) {
  if (existingPlayerId) {
    return existingPlayerId;
  }

  const player = await withPrismaRetry(() =>
    prisma.player.create({
      data: {
        licence: payload.licenseNumber,
        nom: payload.lastName,
        prenom: payload.firstName,
        points: payload.pointsNumber,
        club: payload.club,
        ownerId,
      },
      select: { id: true },
    }),
  );

  return player.id;
}

export async function createTournamentRegistration({
  tournamentId,
  payload,
  selectedEvents,
  sessionUserId,
  ownerId,
}: {
  tournamentId: string;
  payload: NormalizedRegistrationPayload;
  selectedEvents: Array<{ id: string }>;
  sessionUserId: string | null;
  ownerId: string;
}) {
  await withPrismaRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const existingPlayer = await tx.player.findUnique({
          where: { licence: payload.licenseNumber },
          select: { id: true },
        });

        const playerRefId =
          existingPlayer?.id ??
          (
            await tx.player.create({
              data: {
                licence: payload.licenseNumber,
                nom: payload.lastName,
                prenom: payload.firstName,
                points: payload.pointsNumber,
                club: payload.club,
                ownerId,
              },
              select: { id: true },
            })
          ).id;

        const maxPlayer = await tx.tournamentRegistration.aggregate({
          where: { tournamentId },
          _max: { playerId: true },
        });

        const nextPlayerId = (maxPlayer._max.playerId ?? 0) + 1;

        await tx.tournamentRegistration.create({
          data: {
            tournamentId,
            playerId: nextPlayerId,
            playerRefId,
            licenseNumber: payload.licenseNumber,
            clubName: payload.club,
            gender: payload.gender,
            userId: sessionUserId,
            contactEmail: payload.email.toLowerCase(),
            contactPhone: payload.phone,
            source: RegistrationSource.WEB,
            registrationEvents: {
              create: selectedEvents.map((event) => ({
                eventId: event.id,
                seedPointsSnapshot: payload.pointsNumber,
              })),
            },
          },
        });
      },
      { isolationLevel: "Serializable" },
    ),
  );
}

