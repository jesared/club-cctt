import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  // ðŸ”’ sÃ©curitÃ© admin
  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json(messages);
}
