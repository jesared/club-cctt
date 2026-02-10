import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
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
