import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { tournamentId?: string };
  const tournamentId = body.tournamentId?.trim();

  if (!tournamentId) {
    return NextResponse.json(
      { error: "Tournament id requis." },
      { status: 400 },
    );
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true },
  });

  if (!tournament) {
    return NextResponse.json(
      { error: "Tournoi introuvable." },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.tournament.updateMany({
      where: { status: { in: ["PUBLISHED", "SUSPENDED"] }, NOT: { id: tournamentId } },
      data: { status: "CLOSED" },
    });

    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: "PUBLISHED" },
    });
  });

  return NextResponse.json({ ok: true });
}
