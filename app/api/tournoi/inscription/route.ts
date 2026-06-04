import { getCurrentSession } from "@/lib/session";
import {
  checkRateLimit,
  createTournamentRegistration,
  ensureWebRegistrationOwnerId,
  findExistingTournamentRegistrationByLicense,
  formatExistingRegistrationOwner,
  formatExistingRegistrationPlayer,
  getInvalidTables,
  getLatestPublishedTournamentForRegistration,
  getSelectedEvents,
  sendRegistrationNotifications,
  validateAndNormalizeRegistration,
  type RegistrationPayload,
} from "@/lib/tournament-registration";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
import { prisma } from "@/lib/prisma";
import { getTournamentRegistrationNotificationAvailability } from "@/lib/public-form-availability";
import { RegistrationEventStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const notificationAvailability =
    getTournamentRegistrationNotificationAvailability();

  if (!notificationAvailability.isAvailable) {
    return NextResponse.json(
      {
        message:
          "Les inscriptions en ligne sont temporairement indisponibles. Merci de contacter inscriptions-tournoi@cctt.fr.",
      },
      { status: 503 },
    );
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!(await checkRateLimit(clientIp))) {
    return NextResponse.json(
      {
        message:
          "Trop de tentatives depuis votre adresse IP. Merci de reessayer dans quelques minutes.",
      },
      { status: 429 },
    );
  }

  let body: RegistrationPayload;

  try {
    body = (await request.json()) as RegistrationPayload;
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const website =
    typeof body.website === "string" ? body.website.trim() : "";

  if (website.length > 0) {
    return NextResponse.json(
      {
        message: "Votre demande d'inscription a bien été prise en compte.",
      },
      { status: 200 },
    );
  }

  const validation = validateAndNormalizeRegistration(body);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const { payload } = validation;

  const tournament = await getLatestPublishedTournamentForRegistration();
  const registrationStatus = getTournamentRegistrationStatus(tournament);

  if (!tournament) {
    return NextResponse.json(
      {
        message: registrationStatus.message,
      },
      { status: 400 },
    );
  }

  if (!registrationStatus.canRegister) {
    return NextResponse.json(
      {
        message: registrationStatus.message,
      },
      { status: 403 },
    );
  }

  const tournamentId = tournament.id;
  const ownerId = await ensureWebRegistrationOwnerId();
  const session = await getCurrentSession();
  const sessionUserId = session?.user?.id ?? null;
  const existingRegistration = await findExistingTournamentRegistrationByLicense(
    tournamentId,
    payload.licenseNumber,
  );

  if (existingRegistration) {
    return NextResponse.json(
      {
        message: `Cette licence est déjà inscrite pour ${formatExistingRegistrationPlayer(
          existingRegistration,
        )}, rattachée à ${formatExistingRegistrationOwner(
          existingRegistration,
        )}.`,
      },
      { status: 409 },
    );
  }

  const selectedEvents = await getSelectedEvents(
    tournamentId,
    payload.tables,
  );

  if (selectedEvents.length !== payload.tables.length) {
    return NextResponse.json(
      {
        message:
          "Un ou plusieurs tableaux ne sont pas disponibles sur ce tournoi.",
      },
      { status: 400 },
    );
  }

  const invalidTables = getInvalidTables(selectedEvents, payload);

  if (invalidTables.length > 0) {
    return NextResponse.json(
      {
        message: `Les tableaux suivants ne sont pas accessibles avec votre profil: ${invalidTables.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const fullEvents = selectedEvents.filter((event) => {
    if (event.maxPlayers === null) {
      return false;
    }
    return event._count.registrationEvents >= event.maxPlayers;
  });

  const missingWaitlistConsent = fullEvents.filter(
    (event) => !payload.waitlistTables.includes(event.code),
  );

  if (missingWaitlistConsent.length > 0) {
    return NextResponse.json(
      {
        message:
          "Un ou plusieurs tableaux sont complets. Cochez la liste d'attente pour continuer.",
      },
      { status: 400 },
    );
  }

  const selectedEventsWithStatus = selectedEvents.map((event) => ({
    id: event.id,
    code: event.code,
    status:
      fullEvents.some((fullEvent) => fullEvent.id === event.id) &&
      payload.waitlistTables.includes(event.code)
        ? RegistrationEventStatus.WAITLISTED
        : RegistrationEventStatus.REGISTERED,
  }));

  const waitlistedTables = selectedEventsWithStatus
    .filter((event) => event.status === RegistrationEventStatus.WAITLISTED)
    .map((event) => event.code);

  try {
    await createTournamentRegistration({
      tournamentId,
      payload,
      selectedEvents: selectedEventsWithStatus.map(({ id, status }) => ({
        id,
        status,
      })),
      sessionUserId,
      ownerId,
    });
  } catch {
    const existing = await findExistingTournamentRegistrationByLicense(
      tournamentId,
      payload.licenseNumber,
    );

    if (existing) {
      return NextResponse.json(
        {
          message: `Cette licence est déjà inscrite pour ${formatExistingRegistrationPlayer(
            existing,
          )}, rattachée à ${formatExistingRegistrationOwner(existing)}.`,
        },
        { status: 409 },
      );
    }

    const legacyExisting = await prisma.tournamentRegistration.findFirst({
      where: {
        tournamentId,
        licenseNumber: payload.licenseNumber,
      },
      select: { id: true },
    });

    if (legacyExisting) {
      return NextResponse.json(
        {
          message: "Cette licence est déjà inscrite sur ce tournoi.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: "Ce joueur est déjà inscrit sur ce tournoi.",
      },
      { status: 409 },
    );
  }

  const delivery = await sendRegistrationNotifications(payload, {
    tournamentName: tournament.name,
    tournamentContactEmail:
      process.env.TOURNAMENT_REGISTRATION_REPLY_TO_EMAIL ??
      process.env.TOURNAMENT_REGISTRATION_TO_EMAIL ??
      "inscriptions-tournoi@cctt.fr",
    selectedEvents: selectedEventsWithStatus.map((event) => {
      const selectedEvent = selectedEvents.find(
        (selected) => selected.id === event.id,
      );

      return {
        code: event.code,
        label: selectedEvent?.label ?? event.code,
        startAt: selectedEvent?.startAt ?? new Date(),
        feeOnlineCents: selectedEvent?.feeOnlineCents ?? 0,
        status: event.status,
      };
    }),
  });

  if (!delivery.adminNotified) {
    console.error(
      "Tournament registration delivery failed despite available configuration",
      {
        email: payload.email,
        licenseNumber: payload.licenseNumber,
      },
    );

    return NextResponse.json(
      {
        message:
          "Inscription reçue. Le service de notification est en maintenance : contactez inscriptions-tournoi@cctt.fr si vous ne recevez pas de confirmation sous 48 h.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      message:
        waitlistedTables.length > 0
          ? delivery.playerConfirmed
            ? `Inscription envoyée. Vous êtes sur liste d'attente pour : ${waitlistedTables.join(", ")}. Un e-mail récapitulatif vient de vous être envoye.`
            : `Inscription envoyée. Vous êtes sur liste d'attente pour : ${waitlistedTables.join(", ")}.`
          : delivery.playerConfirmed
            ? "Inscription envoyée avec succès. Un e-mail récapitulatif vient de vous être envoye."
            : "Inscription envoyée avec succès. Votre dossier est bien enregistre.",
    },
    { status: 200 },
  );
}





