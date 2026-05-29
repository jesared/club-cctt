import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { withPrismaRetry } from "@/lib/prisma-retry";
import { isAdminRole } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getCurrentSession();
  // Sécurité admin
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const messages = await withPrismaRetry(() =>
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  );

  return NextResponse.json(messages);
}

