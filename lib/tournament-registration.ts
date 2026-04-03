import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { checkPersistentRateLimit } from "@/lib/rate-limit";
import { RegistrationEventStatus, RegistrationSource, type Role } from "@prisma/client";
import type { NormalizedRegistrationPayload } from "./tournament-registration-validation";

export {
  getInvalidTables,
  validateAndNormalizeRegistration,
} from "./tournament-registration-validation";
export type {
  NormalizedRegistrationPayload,
  RegistrationPayload,
} from "./tournament-registration-validation";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

export async function checkRateLimit(clientIp: string) {
  return checkPersistentRateLimit({
    bucketId: `tournoi:${clientIp}`,
    maxRequests: MAX_REQUESTS,
    windowMs: WINDOW_MS,
  });
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
        `Prenom: ${payload.firstName}`,
        `Email: ${payload.email}`,
        `Telephone: ${payload.phone}`,
        `No licence: ${payload.licenseNumber}`,
        `Points: ${payload.points || "Non renseigne"}`,
        `Genre: ${payload.gender || "Non renseigne"}`,
        `Club: ${payload.club}`,
        `Tableaux: ${payload.tables.join(", ")}`,
        `Liste d'attente: ${payload.waitlistTables.join(", ") || "Aucune"}`,
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

export async function getLatestPublishedTournamentForRegistration() {
  return withPrismaRetry(() =>
    prisma.tournament.findFirst({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
        name: true,
        status: true,
        registrationOpenAt: true,
        registrationCloseAt: true,
      },
    }),
  );
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
        status: true,
        gender: true,
        minPoints: true,
        maxPoints: true,
        maxPlayers: true,
        _count: {
          select: {
            registrationEvents: {
              where: {
                status: {
                  in: ["REGISTERED", "CHECKED_IN"],
                },
              },
            },
          },
        },
      },
    }),
  );
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
  selectedEvents: Array<{ id: string; status: RegistrationEventStatus }>;
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
                status: event.status,
              })),
            },
          },
        });
      },
      { isolationLevel: "Serializable" },
    ),
  );
}




