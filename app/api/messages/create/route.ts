import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { title, content, important } = await req.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Titre et contenu obligatoires" },
      { status: 400 },
    );
  }

  await prisma.message.create({
    data: {
      title,
      content,
      important: Boolean(important),
      authorId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
