import { NextResponse } from "next/server";

import { buildVisibleNotificationsWhere } from "@/lib/notifications";
import {
  isNotificationSchemaMissingError,
  withNotificationSchemaFallback,
} from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { getCurrentSession } from "@/lib/session";

export async function POST() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const where = buildVisibleNotificationsWhere(session.user.role);

  const unreadNotifications = await withNotificationSchemaFallback(
    () =>
      withPrismaRetry(() =>
        prisma.notification.findMany({
          where: {
            AND: [
              where,
              {
                reads: {
                  none: {
                    userId: session.user.id,
                  },
                },
              },
            ],
          },
          select: {
            id: true,
          },
        }),
      ),
    [],
  );

  if (unreadNotifications.length === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  try {
    await withPrismaRetry(() =>
      prisma.notificationRead.createMany({
        data: unreadNotifications.map((notification) => ({
          notificationId: notification.id,
          userId: session.user.id,
        })),
        skipDuplicates: true,
      }),
    );
  } catch (error) {
    if (isNotificationSchemaMissingError(error)) {
      return NextResponse.json({ ok: true, count: 0, degraded: true });
    }

    throw error;
  }

  return NextResponse.json({ ok: true, count: unreadNotifications.length });
}
