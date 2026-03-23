import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
  }

  const { id, title, content, important } = await req.json();

  if (!id || !title || !content) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const message = await prisma.message.update({
    where: { id },
    data: {
      title,
      content,
      important: Boolean(important),
    },
  });

  return NextResponse.json(message);
}
