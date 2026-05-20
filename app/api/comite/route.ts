import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  normalizeComiteContent,
  type ComiteResponse,
} from "@/lib/comite-content";
import { getComiteResponse } from "@/lib/comite-service";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

const ADMIN_CONTENT_ID = "admin";

export async function GET() {
  return NextResponse.json<ComiteResponse>(await getComiteResponse());
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<ComiteResponse["data"]>;
  const data = normalizeComiteContent(body);

  const saved = await prisma.comiteCache.upsert({
    where: { id: ADMIN_CONTENT_ID },
    update: { data },
    create: { id: ADMIN_CONTENT_ID, data },
  });

  revalidatePath("/club/comite-directeur");
  revalidatePath("/admin/comite-directeur");

  return NextResponse.json<ComiteResponse>({
    data,
    meta: {
      stale: false,
      updatedAt: saved.updatedAt.toISOString(),
      source: "admin",
    },
  });
}
