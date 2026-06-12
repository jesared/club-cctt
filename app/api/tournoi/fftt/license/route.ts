import { fetchFfttPlayerByLicense } from "@/lib/fftt";
import { getCurrentSession } from "@/lib/session";
import {
  findExistingTournamentRegistrationByLicense,
  formatExistingRegistrationOwner,
  formatExistingRegistrationPlayer,
  getLatestPublishedTournamentForRegistration,
} from "@/lib/tournament-registration";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const licence = searchParams.get("licence")?.trim() ?? "";

  if (!/^\d{3,20}$/.test(licence)) {
    return NextResponse.json(
      { error: "Numéro de licence invalide." },
      { status: 400 },
    );
  }

  const tournament = await getLatestPublishedTournamentForRegistration();

  if (!tournament) {
    return NextResponse.json(
      { error: "Aucun tournoi publié n'est ouvert à l'inscription." },
      { status: 404 },
    );
  }

  const existingRegistration = await findExistingTournamentRegistrationByLicense(
    tournament.id,
    licence,
  );

  if (existingRegistration) {
    const playerName = formatExistingRegistrationPlayer(existingRegistration);
    const ownerName = formatExistingRegistrationOwner(existingRegistration);

    return NextResponse.json(
      {
        error: `Cette licence est déjà inscrite pour ${playerName}, rattachée à ${ownerName}.`,
        reason: "already-registered",
        existingRegistration: {
          playerName,
          ownerName,
          licence: existingRegistration.player.licence,
          club: existingRegistration.player.club,
          status: existingRegistration.status,
        },
      },
      { status: 409 },
    );
  }

  const result = await fetchFfttPlayerByLicense(licence);

  if (result.ok) {
    return NextResponse.json({ player: result.player });
  }

  const statusByReason = {
    "not-configured": 503,
    "not-found": 404,
    "upstream-error": 502,
  } satisfies Record<typeof result.reason, number>;

  return NextResponse.json(
    { error: result.message, reason: result.reason },
    { status: statusByReason[result.reason] },
  );
}
