import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  createTournamentRegistration,
  ensureWebRegistrationOwnerId,
  getInvalidTables,
  getLatestTournamentId,
  getSelectedEvents,
  resolvePlayerRefId,
  sendRegistrationNotifications,
  validateAndNormalizeRegistration,
  type RegistrationPayload,
} from "@/lib/tournament-registration";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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

  const sent = await sendRegistrationNotifications(payload);
  const tournamentId = await getLatestTournamentId();

  if (!tournamentId) {
    return NextResponse.json(
      {
        message: "Aucun tournoi actif n'est disponible pour le moment.",
      },
      { status: 400 },
    );
  }

  const ownerId = await ensureWebRegistrationOwnerId();
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id ?? null;

  const existingPlayer = await prisma.player.findUnique({
    where: { licence: payload.licenseNumber },
    select: { id: true },
  });

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

  const playerRefId = await resolvePlayerRefId({
    existingPlayerId: existingPlayer?.id ?? null,
    payload,
    ownerId,
  });

  try {
    await createTournamentRegistration({
      tournamentId,
      payload,
      selectedEvents,
      playerRefId,
      sessionUserId,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Ce joueur est déjà inscrit sur ce tournoi.",
      },
      { status: 409 },
    );
  }

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
          "Inscription reçue. Le service de notification est en maintenance: contactez inscriptions-tournoi@cctt.fr si vous ne recevez pas de confirmation sous 48h.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      message:
        "Inscription envoyée avec succès. Vous recevrez un email de confirmation après validation.",
    },
    { status: 200 },
  );
}

