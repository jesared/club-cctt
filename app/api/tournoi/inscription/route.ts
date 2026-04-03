import { authOptions } from "@/lib/auth";
import {
  checkRateLimit,
  createTournamentRegistration,
  ensureWebRegistrationOwnerId,
  getInvalidTables,
  getLatestPublishedTournamentForRegistration,
  getSelectedEvents,
  sendRegistrationNotifications,
  validateAndNormalizeRegistration,
  type RegistrationPayload,
} from "@/lib/tournament-registration";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ message: "Requete invalide." }, { status: 400 });
  }

  const website =
    typeof body.website === "string" ? body.website.trim() : "";

  if (website.length > 0) {
    return NextResponse.json(
      {
        message: "Votre demande d'inscription a bien ete prise en compte.",
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
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id ?? null;

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
    const existing = await prisma.tournamentRegistration.findFirst({
      where: {
        tournamentId,
        licenseNumber: payload.licenseNumber,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "Inscription enregistree. Vous recevrez un email de confirmation apres validation.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Ce joueur est deja inscrit sur ce tournoi.",
      },
      { status: 409 },
    );
  }

  const sent = await sendRegistrationNotifications(payload);

  if (!sent) {
    console.error(
      "Tournament registration form is not configured: missing webhook or email provider",
      {
        email: payload.email,
        licenseNumber: payload.licenseNumber,
      },
    );

    return NextResponse.json(
      {
        message:
          "Inscription recue. Le service de notification est en maintenance: contactez inscriptions-tournoi@cctt.fr si vous ne recevez pas de confirmation sous 48h.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      message:
        waitlistedTables.length > 0
          ? `Inscription envoyee. Vous etes sur liste d'attente pour: ${waitlistedTables.join(", ")}.`
          : "Inscription envoyee avec succes. Vous recevrez un email de confirmation apres validation.",
    },
    { status: 200 },
  );
}





