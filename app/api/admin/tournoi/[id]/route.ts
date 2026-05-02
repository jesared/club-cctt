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

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isBeforeStart(startDate: Date) {
  return new Date().getTime() < startDate.getTime();
}

function hasEnded(endDate: Date) {
  return new Date().getTime() >= endDate.getTime();
}

function sameDate(a: Date | null, b: Date | null) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
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
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      venue: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournoi introuvable." }, { status: 404 });
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
  const description = normalizeOptionalText(body.description);
  const venue = normalizeOptionalText(body.venue);

  if (!slug || !name) {
    return NextResponse.json(
      { error: "Nom et slug requis." },
      { status: 400 },
    );
  }

  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);
  const registrationOpenAt = parseDate(body.registrationOpenAt);
  const registrationCloseAt = parseDate(body.registrationCloseAt);

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Dates de debut et fin requises." },
      { status: 400 },
    );
  }

  const canEditAllFields = isBeforeStart(tournament.startDate);
  const canEditStatusOnly = !canEditAllFields && hasEnded(tournament.endDate);

  if (!canEditAllFields) {
    if (!canEditStatusOnly) {
      return NextResponse.json(
        { error: "Le tournoi est en cours. Le statut pourra etre modifie une fois termine." },
        { status: 409 },
      );
    }

    const unchangedFields =
      slug === tournament.slug &&
      name === tournament.name &&
      description === normalizeOptionalText(tournament.description) &&
      venue === normalizeOptionalText(tournament.venue) &&
      sameDate(registrationOpenAt, tournament.registrationOpenAt) &&
      sameDate(registrationCloseAt, tournament.registrationCloseAt) &&
      sameDate(startDate, tournament.startDate) &&
      sameDate(endDate, tournament.endDate);

    if (!unchangedFields) {
      return NextResponse.json(
        { error: "Une fois le tournoi termine, seul le statut peut encore etre modifie." },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.tournament.update({
    where: { id },
    data: {
      slug,
      name,
      description,
      venue,
      registrationOpenAt,
      registrationCloseAt,
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
