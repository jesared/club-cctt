import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { messageId } = await req.json();

  try {
    await withPrismaRetry(() =>
      prisma.messageRead.upsert({
        where: {
          userId_messageId: {
            userId: session.user.id,
            messageId,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          messageId,
        },
      }),
    );
  } catch {
    // déjà lu → on ignore
  }

  return NextResponse.json({ ok: true });
}
