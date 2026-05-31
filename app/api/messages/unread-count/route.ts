import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await withPrismaRetry(() =>
    prisma.message.count({
      where: {
        status: "PUBLISHED",
        reads: {
          none: {
            userId: session.user.id,
          },
        },
      },
    }),
  );

  return NextResponse.json({ count });
}
