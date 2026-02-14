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


type UpdateEngagementsPayload = {
  registrationId?: unknown;
  eventIds?: unknown;
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


export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateEngagementsPayload;
  const registrationId = typeof body.registrationId === "string" ? body.registrationId : "";
  const eventIds = Array.isArray(body.eventIds)
    ? body.eventIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (!registrationId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const registration = await prisma.tournamentRegistration.findUnique({
    where: { id: registrationId },
    select: {
      id: true,
      tournamentId: true,
      registrationEvents: {
        select: {
          id: true,
          eventId: true,
          event: {
            select: {
              code: true,
              startAt: true,
            },
          },
          status: true,
          checkIn: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const allowedEvents = await prisma.tournamentEvent.findMany({
    where: {
      tournamentId: registration.tournamentId,
      id: {
        in: eventIds,
      },
    },
    select: { id: true },
  });

  if (allowedEvents.length !== eventIds.length) {
    return NextResponse.json({ error: "Some events are invalid" }, { status: 400 });
  }

  const existingEventIds = new Set(registration.registrationEvents.map((entry) => entry.eventId));
  const nextEventIds = new Set(eventIds);

  const eventIdsToDelete = registration.registrationEvents
    .filter((entry) => !nextEventIds.has(entry.eventId))
    .map((entry) => entry.eventId);
  const eventIdsToCreate = eventIds.filter((eventId) => !existingEventIds.has(eventId));

  await prisma.$transaction(async (tx) => {
    if (eventIdsToDelete.length > 0) {
      await tx.tournamentRegistrationEvent.deleteMany({
        where: {
          registrationId,
          eventId: {
            in: eventIdsToDelete,
          },
        },
      });
    }

    if (eventIdsToCreate.length > 0) {
      await tx.tournamentRegistrationEvent.createMany({
        data: eventIdsToCreate.map((eventId) => ({
          registrationId,
          eventId,
        })),
        skipDuplicates: true,
      });
    }
  });

  const updatedRegistration = await prisma.tournamentRegistration.findUnique({
    where: { id: registrationId },
    select: {
      id: true,
      registrationEvents: {
        orderBy: [{ event: { startAt: "asc" } }, { event: { code: "asc" } }],
        select: {
          id: true,
          eventId: true,
          event: {
            select: {
              code: true,
              startAt: true,
            },
          },
          status: true,
          checkIn: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!updatedRegistration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const checkedDayKeys = Array.from(
    new Set(
      updatedRegistration.registrationEvents
        .filter((entry) => entry.checkIn !== null || entry.status === RegistrationEventStatus.CHECKED_IN)
        .map((entry) => entry.event.startAt.toISOString().slice(0, 10)),
    ),
  );

  const registrationEventIdsByDay = updatedRegistration.registrationEvents.reduce<Record<string, string[]>>(
    (acc, entry) => {
      const dayKey = entry.event.startAt.toISOString().slice(0, 10);
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(entry.id);
      return acc;
    },
    {},
  );

  return NextResponse.json({
    ok: true,
    player: {
      registrationId: updatedRegistration.id,
      table: updatedRegistration.registrationEvents.map((entry) => entry.event.code).join(", ") || "—",
      engagedEventIds: updatedRegistration.registrationEvents.map((entry) => entry.eventId),
      checkedDayKeys,
      registrationEventIdsByDay,
    },
  });
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
