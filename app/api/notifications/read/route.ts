import { NextResponse } from "next/server";

import { isNotificationSchemaMissingError } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { getCurrentSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { notificationId } = (await req.json()) as {
    notificationId?: string;
  };

  if (!notificationId) {
    return NextResponse.json({ error: "Notification manquante" }, { status: 400 });
  }

  try {
    await withPrismaRetry(() =>
      prisma.notificationRead.upsert({
        where: {
          notificationId_userId: {
            notificationId,
            userId: session.user.id,
          },
        },
        update: {},
        create: {
          notificationId,
          userId: session.user.id,
        },
      }),
    );
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return NextResponse.json({ ok: true, degraded: true });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
