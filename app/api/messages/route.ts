import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const messages = await prisma.message.findMany({
    orderBy: [
      { important: "desc" }, // 🔥 IMPORTANT D’ABORD
      { createdAt: "desc" },
    ],
    include: { author: true },
    take: 20,
  });

  return NextResponse.json(messages);
}
