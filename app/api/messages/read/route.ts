import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { messageId } = await req.json();

  try {
    await prisma.messageRead.upsert({
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
    });
  } catch {
    // déjà lu → on ignore
  }

  return NextResponse.json({ ok: true });
}
