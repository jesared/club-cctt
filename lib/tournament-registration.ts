import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { checkPersistentRateLimit } from "@/lib/rate-limit";
import {
  RegistrationEventStatus,
  RegistrationSource,
  type Role,
} from "@prisma/client";
import { ACTIVE_TOURNAMENT_STATUSES } from "@/lib/tournament-status";
import {
  buildTournamentRegistrationAdminHtml,
  buildTournamentRegistrationAdminText,
  buildTournamentRegistrationPlayerHtml,
  buildTournamentRegistrationPlayerText,
  type RegistrationEmailContext,
} from "./tournament-registration-email";
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

export type ExistingTournamentRegistration = Awaited<
  ReturnType<typeof findExistingTournamentRegistrationByLicense>
>;

export async function checkRateLimit(clientIp: string) {
  return checkPersistentRateLimit({
    bucketId: `tournoi:${clientIp}`,
    maxRequests: MAX_REQUESTS,
    windowMs: WINDOW_MS,
  });
}

export async function sendRegistrationNotifications(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  const adminNotifiedWithWebhook = await sendWithWebhook(payload, context);
  const adminNotifiedWithResend = adminNotifiedWithWebhook
    ? false
    : await sendAdminWithResend(payload, context);
  const playerConfirmed = await sendPlayerConfirmationWithResend(payload, context);

  return {
    adminNotified: adminNotifiedWithWebhook || adminNotifiedWithResend,
    playerConfirmed,
  };
}

async function sendWithWebhook(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
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
      tournamentName: context.tournamentName,
      selectedEvents: context.selectedEvents,
      source: "cctt-tournament-registration-form",
      sentAt: new Date().toISOString(),
    }),
  });

  return response.ok;
}

async function sendAdminWithResend(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.TOURNAMENT_REGISTRATION_TO_EMAIL;

  if (!resendApiKey || !to) {
    return false;
  }

  const from =
    process.env.TOURNAMENT_REGISTRATION_FROM_EMAIL ??
    "CCTT Tournoi <contact@mail.cctt.fr>";

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
      text: buildTournamentRegistrationAdminText(payload, context),
      html: buildTournamentRegistrationAdminHtml(payload, context),
    }),
  });

  return response.ok;
}

async function sendPlayerConfirmationWithResend(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return false;
  }

  const from =
    process.env.TOURNAMENT_REGISTRATION_CONFIRMATION_FROM_EMAIL ??
    process.env.TOURNAMENT_REGISTRATION_FROM_EMAIL ??
    "CCTT Tournoi <contact@mail.cctt.fr>";

  const replyTo =
    process.env.TOURNAMENT_REGISTRATION_REPLY_TO_EMAIL ??
    process.env.TOURNAMENT_REGISTRATION_TO_EMAIL;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.email,
      subject: `Confirmation d'inscription - ${context.tournamentName}`,
      ...(replyTo ? { reply_to: replyTo } : {}),
      text: buildTournamentRegistrationPlayerText(payload, context),
      html: buildTournamentRegistrationPlayerHtml(payload, context),
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
        status: { in: ACTIVE_TOURNAMENT_STATUSES },
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

export async function findExistingTournamentRegistrationByLicense(
  tournamentId: string,
  licenseNumber: string,
) {
  const normalizedLicense = licenseNumber.trim();

  if (!normalizedLicense) {
    return null;
  }

  return withPrismaRetry(() =>
    prisma.tournamentRegistration.findFirst({
      where: {
        tournamentId,
        OR: [
          { licenseNumber: normalizedLicense },
          {
            player: {
              licence: normalizedLicense,
            },
          },
        ],
      },
      select: {
        id: true,
        status: true,
        contactEmail: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        player: {
          select: {
            nom: true,
            prenom: true,
            licence: true,
            club: true,
          },
        },
      },
    }),
  );
}

export function formatExistingRegistrationOwner(
  existingRegistration: NonNullable<ExistingTournamentRegistration>,
) {
  return (
    existingRegistration.user?.name?.trim() ||
    existingRegistration.user?.email?.trim() ||
    existingRegistration.contactEmail?.trim() ||
    "un utilisateur"
  );
}

export function formatExistingRegistrationPlayer(
  existingRegistration: NonNullable<ExistingTournamentRegistration>,
) {
  return (
    `${existingRegistration.player.prenom} ${existingRegistration.player.nom}`.trim() ||
    `licence ${existingRegistration.player.licence}`
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
        label: true,
        status: true,
        startAt: true,
        feeOnlineCents: true,
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




