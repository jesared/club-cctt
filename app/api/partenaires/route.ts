export const runtime = "nodejs";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/session";
import {
  defaultPartenairesContent,
  isValidPartenairesData,
  normalizePartenairesContent,
  type PartenairesResponse,
} from "@/lib/partenaires-content";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

const ADMIN_CONTENT_ID = "admin";
const DRIVE_CACHE_ID = "drive";

export async function GET() {
  const adminContent = await prisma.partenairesCache.findUnique({
    where: { id: ADMIN_CONTENT_ID },
  });

  if (adminContent && isValidPartenairesData(adminContent.data)) {
    return NextResponse.json<PartenairesResponse>({
      data: normalizePartenairesContent(adminContent.data),
      meta: {
        stale: false,
        updatedAt: adminContent.updatedAt.toISOString(),
        source: "admin",
      },
    });
  }

  const fileId = process.env.PARTENAIRES_JSON_ID;

  if (fileId) {
    try {
      const res = await fetch(
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error("Drive inaccessible");
      }

      const remoteData: unknown = await res.json();

      if (!isValidPartenairesData(remoteData)) {
        throw new Error("Format JSON invalide");
      }

      const data = normalizePartenairesContent(remoteData);
      const cached = await prisma.partenairesCache.upsert({
        where: { id: DRIVE_CACHE_ID },
        update: { data },
        create: { id: DRIVE_CACHE_ID, data },
      });

      return NextResponse.json<PartenairesResponse>({
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
    const cached = await prisma.partenairesCache.findUnique({
      where: { id: DRIVE_CACHE_ID },
    });

    if (cached && isValidPartenairesData(cached.data)) {
      return NextResponse.json<PartenairesResponse>({
        data: normalizePartenairesContent(cached.data),
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

  return NextResponse.json<PartenairesResponse>({
    data: defaultPartenairesContent,
    meta: {
      stale: true,
      updatedAt: null,
      source: "fallback",
    },
  });
}

export async function PUT(req: Request) {
  const session = await getCurrentSession();

  if (!session || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<PartenairesResponse["data"]>;
  const data = normalizePartenairesContent(body);

  const saved = await prisma.partenairesCache.upsert({
    where: { id: ADMIN_CONTENT_ID },
    update: { data },
    create: { id: ADMIN_CONTENT_ID, data },
  });

  revalidatePath("/club/partenaires");
  revalidatePath("/admin/partenaires");

  return NextResponse.json<PartenairesResponse>({
    data,
    meta: {
      stale: false,
      updatedAt: saved.updatedAt.toISOString(),
      source: "admin",
    },
  });
}
