import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function toCsvValue(value: string | number) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await prisma.tournament.findFirst({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    orderBy: [{ startDate: "desc" }],
    select: { id: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: "No active tournament" }, { status: 404 });
  }

  const registrations = await prisma.tournamentRegistration.findMany({
    where: { tournamentId: tournament.id },
    select: {
      playerId: true,
      player: {
        select: {
          nom: true,
          prenom: true,
          licence: true,
          club: true,
          points: true,
        },
      },
      registrationEvents: {
        orderBy: [{ event: { startAt: "asc" } }, { event: { code: "asc" } }],
        select: {
          status: true,
          event: {
            select: {
              code: true,
              label: true,
            },
          },
        },
      },
    },
  });

  const rows = registrations.map((registration) => {
    const playerName = `${registration.player.prenom} ${registration.player.nom}`.trim();
    const points = registration.player.points ?? "";
    const tables = registration.registrationEvents.map((entry) => {
      const code = entry.event.code ?? "";
      const label = entry.event.label ?? "";
      const status = entry.status ?? "";
      const display = label ? `${code} - ${label}`.trim() : code;
      return status ? `${display} (${status})` : display;
    });

    return {
      dossard: registration.playerId,
      player: playerName,
      licence: registration.player.licence ?? "",
      club: registration.player.club ?? "",
      points,
      tables: tables.join(" | "),
    };
  });

  rows.sort((a, b) => a.player.localeCompare(b.player));

  const header = ["Dossard", "Joueur", "Licence", "Club", "Points", "Tableaux"];

  const csv = [
    header.map(toCsvValue).join(";"),
    ...rows.map((row) =>
      [
        toCsvValue(row.dossard),
        toCsvValue(row.player),
        toCsvValue(row.licence),
        toCsvValue(row.club),
        toCsvValue(row.points),
        toCsvValue(row.tables),
      ].join(";"),
    ),
  ].join("\n");

  return new NextResponse(`\ufeff${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=joueurs-tableaux.csv",
    },
  });
}
