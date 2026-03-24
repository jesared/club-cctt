import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import JSZip from "jszip";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function toCsvValue(value: string | number) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function sanitizeFilename(value: string) {
  return value.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}

function buildTableCsv(event: {
  code: string;
  label: string;
  registrations: {
    status: string;
    playerId: number;
    player: {
      nom: string;
      prenom: string;
      licence: string;
      club: string | null;
      points: number | null;
    };
  }[];
}) {
  const rows = event.registrations
    .map((entry) => {
      return {
        licence: entry.player.licence ?? "",
        dossard: entry.playerId,
        nom: entry.player.nom ?? "",
        prenom: entry.player.prenom ?? "",
        points: entry.player.points ?? "",
        club: entry.player.club ?? "",
      };
    })
    .sort((a, b) => `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, "fr"));

  const header = ["Licence", "Dossard", "Nom", "Prenom", "Points", "Nom du club"];

  const countRow = [
    toCsvValue("Nombre joueurs"),
    toCsvValue(rows.length),
    ...Array.from({ length: header.length - 2 }, () => toCsvValue("")),
  ].join(";");

  return [
    "\ufeff" + countRow,
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

  const events = await prisma.tournamentEvent.findMany({
    where: { tournamentId: tournament.id },
    orderBy: [{ startAt: "asc" }, { code: "asc" }],
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

  const zip = new JSZip();

  for (const event of events) {
    const csv = buildTableCsv({
      code: event.code,
      label: event.label,
      registrations: event.registrationEvents.map((entry) => ({
        status: entry.status,
        playerId: entry.registration.playerId,
        player: entry.registration.player,
      })),
    });

    const filename = sanitizeFilename(`${event.code}-${event.label}`) || sanitizeFilename(event.code);
    zip.file(`${filename || "tableau"}.csv`, csv);
  }

  const payload = await zip.generateAsync({ type: "nodebuffer" });
  const body = new Uint8Array(payload);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=tableaux.zip",
    },
  });
}
