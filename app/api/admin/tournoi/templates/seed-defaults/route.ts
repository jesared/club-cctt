import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "1";

  const existingTemplate = await prisma.tournamentTemplate.findUnique({
    where: { id: "default" },
    select: { id: true },
  });
  const existingEvents = await prisma.tournamentEventTemplate.findFirst({
    select: { id: true },
  });

  if ((existingTemplate || existingEvents) && !force) {
    return NextResponse.json(
      { error: "Templates deja initialises." },
      { status: 409 },
    );
  }
  if (force) {
    await prisma.tournamentEventTemplate.deleteMany();
    await prisma.tournamentTemplate.deleteMany();
  }

  const latestTournament = await prisma.tournament.findFirst({
    orderBy: { startDate: "desc" },
    include: { events: true },
  });

  if (!latestTournament) {
    return NextResponse.json(
      { error: "Aucun tournoi existant pour pre-remplir." },
      { status: 400 },
    );
  }

  if (latestTournament.events.length === 0) {
    return NextResponse.json(
      { error: "Le dernier tournoi n'a pas de tableaux." },
      { status: 400 },
    );
  }

  const tournamentTemplate = await prisma.tournamentTemplate.create({
    data: {
      id: "default",
      slug: latestTournament.slug,
      name: latestTournament.name,
      description: latestTournament.description ?? null,
      venue: latestTournament.venue ?? null,
      registrationOpenAt: latestTournament.registrationOpenAt,
      registrationCloseAt: latestTournament.registrationCloseAt,
      startDate: latestTournament.startDate,
      endDate: latestTournament.endDate,
      status: "DRAFT",
    },
  });

  const eventTemplates = await prisma.tournamentEventTemplate.createMany({
    data: latestTournament.events.map((event) => ({
      code: event.code,
      label: event.label,
      gender: event.gender,
      minPoints: event.minPoints ?? null,
      maxPoints: event.maxPoints ?? null,
      maxPlayers: event.maxPlayers,
      startAt: event.startAt,
      feeOnlineCents: event.feeOnlineCents,
      feeOnsiteCents: event.feeOnsiteCents,
      status: event.status,
    })),
  });

  return NextResponse.json({
    tournamentTemplate,
    eventTemplatesCreated: eventTemplates.count,
  });
}
