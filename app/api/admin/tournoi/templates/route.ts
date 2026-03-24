import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournamentTemplate = await prisma.tournamentTemplate.findUnique({
    where: { id: "default" },
  });

  const eventTemplates = await prisma.tournamentEventTemplate.findMany({
    orderBy: [{ code: "asc" }],
  });

  return NextResponse.json({ tournamentTemplate, eventTemplates });
}
