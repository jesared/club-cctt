import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function toCsvValue(value: string | number) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function sanitizeFilename(value: string) {
  return value.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  const tournament = await prisma.tournament.findFirst({
    where: { status: { in: ["PUBLISHED", "DRAFT"] } },
    orderBy: [{ startDate: "desc" }],
    select: { id: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: "No active tournament" }, { status: 404 });
  }

  const event = await prisma.tournamentEvent.findFirst({
    where: {
      id: eventId,
      tournamentId: tournament.id,
    },
    select: {
      code: true,
      label: true,
      registrationEvents: {
        select: {
          status: true,
          registration: {
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
            },
          },
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const rows = event.registrationEvents
    .map((entry) => {
      return {
        licence: entry.registration.player.licence ?? "",
        dossard: entry.registration.playerId,
        nom: entry.registration.player.nom ?? "",
        prenom: entry.registration.player.prenom ?? "",
        points: entry.registration.player.points ?? "",
        club: entry.registration.player.club ?? "",
      };
    })
    .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr"));

  const header = ["Licence", "Dossard", "Nom", "Prenom", "Points", "Nom du club"];

  const countRow = [
    toCsvValue("Nombre joueurs"),
    toCsvValue(rows.length),
    ...Array.from({ length: header.length - 2 }, () => toCsvValue("")),
  ].join(";");

  const csv = [
    countRow,
    header.map(toCsvValue).join(";"),
    ...rows.map((row) =>
      [
        toCsvValue(row.licence),
        toCsvValue(row.dossard),
        toCsvValue(row.nom),
        toCsvValue(row.prenom),
        toCsvValue(row.points),
        toCsvValue(row.club),
      ].join(";"),
    ),
  ].join("\n");

  const filename = sanitizeFilename(`${event.code}-${event.label}`) || sanitizeFilename(event.code);

  return new NextResponse(`\ufeff${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename || "tableau"}.csv`,
    },
  });
}
