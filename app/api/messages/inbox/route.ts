import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const messages = await withPrismaRetry(() =>
    prisma.message.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ important: "desc" }, { createdAt: "desc" }],
      take: 4,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        reads: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    }),
  );

  const unreadCount = await withPrismaRetry(() =>
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

  return NextResponse.json({
    unreadCount,
    items: messages.map((message) => ({
      id: message.id,
      title: message.title,
      content: message.content,
      important: message.important,
      createdAt: message.createdAt,
      authorName: message.author.name,
      authorEmail: message.author.email,
      isUnread: message.reads.length === 0,
    })),
  });
}
