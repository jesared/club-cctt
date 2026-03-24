import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function getUniqueSlug(baseSlug: string) {
  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.tournament.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = await prisma.tournamentTemplate.findUnique({
    where: { id: "default" },
  });

  if (!template) {
    return NextResponse.json(
      { error: "Template tournoi manquant." },
      { status: 400 },
    );
  }

  const eventTemplates = await prisma.tournamentEventTemplate.findMany({
    orderBy: [{ code: "asc" }],
  });

  if (eventTemplates.length === 0) {
    return NextResponse.json(
      { error: "Aucun template de tableau disponible." },
      { status: 400 },
    );
  }

  const baseSlug = slugify(template.slug || template.name);
  const slug = await getUniqueSlug(baseSlug);

  const created = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.create({
      data: {
        slug,
        name: template.name,
        description: template.description,
        venue: template.venue,
        registrationOpenAt: template.registrationOpenAt,
        registrationCloseAt: template.registrationCloseAt,
        startDate: template.startDate,
        endDate: template.endDate,
        status: template.status,
      },
    });

    await tx.tournamentEvent.createMany({
      data: eventTemplates.map((event) => ({
        tournamentId: tournament.id,
        code: event.code,
        label: event.label,
        gender: event.gender,
        minPoints: event.minPoints,
        maxPoints: event.maxPoints,
        maxPlayers: event.maxPlayers,
        startAt: event.startAt,
        feeOnlineCents: event.feeOnlineCents,
        feeOnsiteCents: event.feeOnsiteCents,
        status: event.status,
      })),
    });

    return tournament;
  });

  return NextResponse.json({ tournament: created });
}
