import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { NextResponse } from "next/server";

export async function GET() {
  const messages = await withPrismaRetry(() =>
    prisma.message.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [
        { important: "desc" }, // Important d'abord
        { createdAt: "desc" },
      ],
      include: { author: true },
      take: 20,
    }),
  );

  return NextResponse.json(messages);
}
