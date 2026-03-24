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

function isEditable(startDate: Date) {
  return new Date().getTime() < startDate.getTime();
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      events: {
        orderBy: [{ startAt: "asc" }, { code: "asc" }],
      },
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournoi introuvable." }, { status: 404 });
  }

  return NextResponse.json({ tournament });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    select: { id: true, startDate: true },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournoi introuvable." }, { status: 404 });
  }

  if (!isEditable(tournament.startDate)) {
    return NextResponse.json(
      { error: "Le tournoi a deja demarre, modification impossible." },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    description?: string | null;
    venue?: string | null;
    registrationOpenAt?: string | null;
    registrationCloseAt?: string | null;
    startDate?: string;
    endDate?: string;
    status?: string;
  };

  const slug = (body.slug ?? "").trim();
  const name = (body.name ?? "").trim();

  if (!slug || !name) {
    return NextResponse.json(
      { error: "Nom et slug requis." },
      { status: 400 },
    );
  }

  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Dates de debut et fin requises." },
      { status: 400 },
    );
  }

  const updated = await prisma.tournament.update({
    where: { id: params.id },
    data: {
      slug,
      name,
      description: body.description ?? null,
      venue: body.venue ?? null,
      registrationOpenAt: parseDate(body.registrationOpenAt),
      registrationCloseAt: parseDate(body.registrationCloseAt),
      startDate,
      endDate,
      status:
        body.status === "PUBLISHED"
          ? "PUBLISHED"
          : body.status === "CLOSED"
            ? "CLOSED"
            : body.status === "ARCHIVED"
              ? "ARCHIVED"
              : "DRAFT",
    },
  });

  return NextResponse.json({ tournament: updated });
}
