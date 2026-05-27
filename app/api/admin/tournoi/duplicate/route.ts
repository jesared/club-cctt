import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

function parseDate(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    sourceTournamentId?: string;
    slug?: string;
    name?: string;
    description?: string | null;
    venue?: string | null;
    registrationOpenAt?: string | null;
    registrationCloseAt?: string | null;
    startDate?: string;
    endDate?: string;
  };

  const sourceTournamentId = body.sourceTournamentId?.trim();
  const slug = body.slug?.trim();
  const name = body.name?.trim();
  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);
  const registrationOpenAt = parseDate(body.registrationOpenAt);
  const registrationCloseAt = parseDate(body.registrationCloseAt);

  if (!sourceTournamentId) {
    return NextResponse.json(
      { error: "Tournoi source requis." },
      { status: 400 },
    );
  }

  if (!slug || !name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "Nom, slug, debut et fin du tournoi sont requis." },
      { status: 400 },
    );
  }

  if (endDate.getTime() < startDate.getTime()) {
    return NextResponse.json(
      { error: "La fin du tournoi doit etre apres le debut." },
      { status: 400 },
    );
  }

  if (
    registrationOpenAt &&
    registrationCloseAt &&
    registrationCloseAt.getTime() < registrationOpenAt.getTime()
  ) {
    return NextResponse.json(
      { error: "La fermeture des inscriptions doit etre apres l'ouverture." },
      { status: 400 },
    );
  }

  const [source, slugOwner] = await Promise.all([
    prisma.tournament.findUnique({
      where: { id: sourceTournamentId },
      include: {
        events: {
          orderBy: [{ startAt: "asc" }, { code: "asc" }],
        },
      },
    }),
    prisma.tournament.findUnique({
      where: { slug },
      select: { id: true },
    }),
  ]);

  if (!source) {
    return NextResponse.json({ error: "Tournoi source introuvable." }, { status: 404 });
  }

  if (slugOwner) {
    return NextResponse.json(
      { error: "Ce slug est deja utilise par un autre tournoi." },
      { status: 409 },
    );
  }

  if (source.events.length === 0) {
    return NextResponse.json(
      { error: "Le tournoi source ne contient aucun tableau a dupliquer." },
      { status: 400 },
    );
  }

  const dateOffsetMs = startDate.getTime() - source.startDate.getTime();

  const created = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.create({
      data: {
        slug,
        name,
        description: normalizeOptionalText(body.description),
        venue: normalizeOptionalText(body.venue),
        registrationOpenAt,
        registrationCloseAt,
        startDate,
        endDate,
        status: "DRAFT",
      },
    });

    await tx.tournamentEvent.createMany({
      data: source.events.map((event) => ({
        tournamentId: tournament.id,
        code: event.code,
        label: event.label,
        gender: event.gender,
        minPoints: event.minPoints,
        maxPoints: event.maxPoints,
        maxPlayers: event.maxPlayers,
        startAt: new Date(event.startAt.getTime() + dateOffsetMs),
        feeOnlineCents: event.feeOnlineCents,
        feeOnsiteCents: event.feeOnsiteCents,
        status: "OPEN",
      })),
    });

    return tournament;
  });

  return NextResponse.json({ tournament: created });
}
