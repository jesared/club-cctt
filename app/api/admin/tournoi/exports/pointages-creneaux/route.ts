import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function toCsvValue(value: string | number) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

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
              startAt: true,
              label: true,
              maxPlayers: true,
              minPoints: true,
              maxPoints: true,
            },
          },
          checkIn: {
            select: {
              checkedInAt: true,
            },
          },
        },
      },
    },
  });

  const rows = registrations.flatMap((registration) =>
    registration.registrationEvents.map((entry) => {
      const playerName = `${registration.player.prenom} ${registration.player.nom}`.trim();
      const points = registration.player.points ?? "";
      const checkedInAt = entry.checkIn?.checkedInAt
        ? new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(entry.checkIn.checkedInAt)
        : "";

      return {
        eventStartAt: entry.event.startAt,
        dateTime: DATE_TIME_FORMATTER.format(entry.event.startAt),
        table: entry.event.code,
        label: entry.event.label,
        dossard: registration.playerId,
        player: playerName,
        licence: registration.player.licence ?? "",
        club: registration.player.club ?? "",
        points,
        status: entry.status,
        checkedInAt,
      };
    }),
  );

  rows.sort((a, b) => {
    const timeDiff = a.eventStartAt.getTime() - b.eventStartAt.getTime();
    if (timeDiff !== 0) {
      return timeDiff;
    }

    const tableDiff = a.table.localeCompare(b.table);
    if (tableDiff !== 0) {
      return tableDiff;
    }

    return a.player.localeCompare(b.player);
  });

  const header = [
    "Date",
    "Tableau",
    "Label",
    "Dossard",
    "Joueur",
    "Licence",
    "Club",
    "Points",
    "Statut",
    "Heure pointage",
  ];

  const csv = [
    header.map(toCsvValue).join(";"),
    ...rows.map((row) =>
      [
        toCsvValue(row.dateTime),
        toCsvValue(row.table),
        toCsvValue(row.label),
        toCsvValue(row.dossard),
        toCsvValue(row.player),
        toCsvValue(row.licence),
        toCsvValue(row.club),
        toCsvValue(row.points),
        toCsvValue(row.status),
        toCsvValue(row.checkedInAt),
      ].join(";"),
    ),
  ].join("\n");

  return new NextResponse(`\ufeff${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=pointages-creneaux.csv",
    },
  });
}

