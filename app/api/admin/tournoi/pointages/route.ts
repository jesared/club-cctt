import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const registrationEventIds = Array.isArray(body?.registrationEventIds)
    ? body.registrationEventIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
    : [];
  const checked = Boolean(body?.checked);

  if (registrationEventIds.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (checked) {
    await prisma.$transaction([
      prisma.tournamentCheckIn.createMany({
        data: registrationEventIds.map((registrationEventId) => ({
          registrationEventId,
          checkedInByUserId: session.user.id,
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
