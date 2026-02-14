import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type PointagePayload = {
  registrationEventIds?: unknown;
  checked?: unknown;
};

type DeletePlayerPayload = {
  registrationId?: unknown;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PointagePayload;
  const registrationEventIds = Array.isArray(body.registrationEventIds)
    ? body.registrationEventIds.filter(
        (id: unknown): id is string => typeof id === "string" && id.length > 0,
      )
    : [];
  const checked = Boolean(body.checked);

  if (registrationEventIds.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const checkedInByUserId =
    typeof session.user.id === "string" && session.user.id.length > 0
      ? session.user.id
      : null;

  if (checked) {
    await prisma.$transaction([
      prisma.tournamentCheckIn.createMany({
        data: registrationEventIds.map((registrationEventId: string) => ({
          registrationEventId,
          checkedInByUserId,
        })),
        skipDuplicates: true,
      }),
      prisma.tournamentRegistrationEvent.updateMany({
        where: { id: { in: registrationEventIds } },
        data: { status: RegistrationEventStatus.CHECKED_IN },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.tournamentCheckIn.deleteMany({
        where: { registrationEventId: { in: registrationEventIds } },
      }),
      prisma.tournamentRegistrationEvent.updateMany({
        where: {
          id: { in: registrationEventIds },
          status: RegistrationEventStatus.CHECKED_IN,
        },
        data: { status: RegistrationEventStatus.REGISTERED },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as DeletePlayerPayload;
  const registrationId = typeof body.registrationId === "string" ? body.registrationId : "";

  if (!registrationId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const registration = await prisma.tournamentRegistration.findUnique({
    where: { id: registrationId },
    select: { playerRefId: true },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.tournamentRegistration.deleteMany({
      where: { playerRefId: registration.playerRefId },
    });

    await tx.player.delete({
      where: { id: registration.playerRefId },
    });
  });

  return NextResponse.json({ ok: true });
}
