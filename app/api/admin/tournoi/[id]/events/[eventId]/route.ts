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

function parseIntValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function isEditable(startDate: Date) {
  return new Date().getTime() < startDate.getTime();
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; eventId: string } },
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
    code?: string;
    label?: string;
    gender?: string;
    minPoints?: string | number | null;
    maxPoints?: string | number | null;
    maxPlayers?: string | number | null;
    startAt?: string;
    feeOnlineCents?: string | number | null;
    feeOnsiteCents?: string | number | null;
    status?: string;
  };

  const code = (body.code ?? "").trim().toUpperCase();
  const label = (body.label ?? "").trim();
  const startAt = parseDate(body.startAt);
  const feeOnlineCents = parseIntValue(body.feeOnlineCents);
  const feeOnsiteCents = parseIntValue(body.feeOnsiteCents);
  const maxPlayers = parseIntValue(body.maxPlayers) ?? 32;

  if (!code || !label || !startAt || feeOnlineCents === null || feeOnsiteCents === null) {
    return NextResponse.json(
      { error: "Code, label, date et frais requis." },
      { status: 400 },
    );
  }

  const event = await prisma.tournamentEvent.update({
    where: { id: params.eventId },
    data: {
      code,
      label,
      gender: body.gender === "F" ? "F" : body.gender === "M" ? "M" : "MIXED",
      minPoints: parseIntValue(body.minPoints),
      maxPoints: parseIntValue(body.maxPoints),
      maxPlayers,
      startAt,
      feeOnlineCents,
      feeOnsiteCents,
      status:
        body.status === "FULL"
          ? "FULL"
          : body.status === "CLOSED"
            ? "CLOSED"
            : body.status === "CANCELLED"
              ? "CANCELLED"
              : "OPEN",
    },
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; eventId: string } },
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
      { error: "Le tournoi a deja demarre, suppression impossible." },
      { status: 409 },
    );
  }

  await prisma.tournamentEvent.delete({
    where: { id: params.eventId },
  });

  return NextResponse.json({ ok: true });
}
