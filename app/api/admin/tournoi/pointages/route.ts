import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus } from "@prisma/client";
import { NextResponse } from "next/server";

type PointagePayload = {
  registrationEventIds?: unknown;
  checked?: unknown;
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
