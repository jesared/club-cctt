import { NextResponse } from "next/server";

import { buildVisibleNotificationsWhere } from "@/lib/notifications";
import { withNotificationSchemaFallback } from "@/lib/notification-safety";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const where = buildVisibleNotificationsWhere(session.user.role);

  const count = await withNotificationSchemaFallback(
    () =>
      withPrismaRetry(() =>
        prisma.notification.count({
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
        }),
      ),
    0,
  );

  return NextResponse.json({ count });
}
