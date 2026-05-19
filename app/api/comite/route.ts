import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  defaultComiteContent,
  isValidComiteData,
  normalizeComiteContent,
  type ComiteResponse,
} from "@/lib/comite-content";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

const ADMIN_CONTENT_ID = "admin";
const DRIVE_CACHE_ID = "drive";

export async function GET() {
  const adminContent = await prisma.comiteCache.findUnique({
    where: { id: ADMIN_CONTENT_ID },
  });

  if (adminContent && isValidComiteData(adminContent.data)) {
    return NextResponse.json<ComiteResponse>({
      data: normalizeComiteContent(adminContent.data),
      meta: {
        stale: false,
        updatedAt: adminContent.updatedAt.toISOString(),
        source: "admin",
      },
    });
  }

  const fileId = process.env.COMITE_JSON_ID;

  if (fileId) {
    try {
      const res = await fetch(
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        throw new Error("Drive inaccessible");
      }

      const remoteData: unknown = await res.json();

      if (!isValidComiteData(remoteData)) {
        throw new Error("Format JSON invalide");
      }

      const data = normalizeComiteContent(remoteData);
      const cached = await prisma.comiteCache.upsert({
        where: { id: DRIVE_CACHE_ID },
        update: { data },
        create: { id: DRIVE_CACHE_ID, data },
      });

      return NextResponse.json<ComiteResponse>({
        data,
        meta: {
          stale: false,
          updatedAt: cached.updatedAt.toISOString(),
          source: "drive",
        },
      });
    } catch {
      // fallback on cached drive data below
    }
  }

  try {
    const cached = await prisma.comiteCache.findUnique({
      where: { id: DRIVE_CACHE_ID },
    });

    if (cached && isValidComiteData(cached.data)) {
      return NextResponse.json<ComiteResponse>({
        data: normalizeComiteContent(cached.data),
        meta: {
          stale: true,
          updatedAt: cached.updatedAt.toISOString(),
          source: "drive",
        },
      });
    }
  } catch {
    // ignore cache errors and return fallback
  }

  return NextResponse.json<ComiteResponse>({
    data: defaultComiteContent,
    meta: {
      stale: true,
      updatedAt: null,
      source: "fallback",
    },
  });
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
