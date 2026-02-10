import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const reads = await prisma.messageRead.findMany({
    where: { messageId: params.id },
    include: {
      user: true,
    },
  });

  return NextResponse.json(reads);
}
