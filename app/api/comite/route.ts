import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ComiteData = {
  bureau: Array<{
    poste: string;
    nom: string;
    description: string;
    photo: string;
  }>;
  membres: Array<{
    nom: string;
  }>;
  salaries: Array<{
    nom: string;
  }>;
};

type ComiteResponse = {
  data: ComiteData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

const fallbackComite: ComiteData = {
  bureau: [],
  membres: [],
  salaries: [],
};

function isValidComiteData(value: unknown): value is ComiteData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<ComiteData>;

  return (
    Array.isArray(data.bureau) &&
    data.bureau.every(
      (membre) =>
        typeof membre?.poste === "string" &&
        typeof membre?.nom === "string" &&
        typeof membre?.description === "string" &&
        typeof membre?.photo === "string",
    ) &&
    Array.isArray(data.membres) &&
    data.membres.every((membre) => typeof membre?.nom === "string") &&
    Array.isArray(data.salaries) &&
    data.salaries.every((salarie) => typeof salarie?.nom === "string")
  );
}

export async function GET() {
  const fileId = process.env.COMITE_JSON_ID;

  if (!fileId) {
    return NextResponse.json<ComiteResponse>({
      data: fallbackComite,
      meta: { stale: true, updatedAt: null },
    });
  }

  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("Drive inaccessible");

    const data: unknown = await res.json();

    if (!isValidComiteData(data)) {
      throw new Error("Format JSON invalide");
    }

    const cached = await prisma.comiteCache.upsert({
      where: { id: "default" },
      update: { data },
      create: { id: "default", data },
    });

    return NextResponse.json<ComiteResponse>({
      data,
      meta: { stale: false, updatedAt: cached.updatedAt.toISOString() },
    });
  } catch {
    try {
      const cached = await prisma.comiteCache.findUnique({
        where: { id: "default" },
      });

      if (cached && isValidComiteData(cached.data)) {
        return NextResponse.json<ComiteResponse>({
          data: cached.data,
          meta: { stale: true, updatedAt: cached.updatedAt.toISOString() },
        });
      }
    } catch {
      // ignore cache errors and return fallback
    }

    return NextResponse.json<ComiteResponse>({
      data: fallbackComite,
      meta: { stale: true, updatedAt: null },
    });
  }
}
