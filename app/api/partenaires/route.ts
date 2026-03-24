export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Partenaire = {
  nom: string;
  description: string;
  logo: string;
  url?: string;
};

type PartenairesData = {
  institutionnels: Partenaire[];
  prives: Partenaire[];
};

type PartenairesResponse = {
  data: PartenairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

const fallbackPartenaires: PartenairesData = {
  institutionnels: [],
  prives: [],
};

function isValidPartenaire(partenaire: unknown): partenaire is Partenaire {
  if (!partenaire || typeof partenaire !== "object") return false;

  const p = partenaire as Partial<Partenaire>;

  return (
    typeof p.nom === "string" &&
    typeof p.description === "string" &&
    typeof p.logo === "string" &&
    (typeof p.url === "undefined" || typeof p.url === "string")
  );
}

function isValidPartenairesData(value: unknown): value is PartenairesData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<PartenairesData>;

  return (
    Array.isArray(data.institutionnels) &&
    data.institutionnels.every(isValidPartenaire) &&
    Array.isArray(data.prives) &&
    data.prives.every(isValidPartenaire)
  );
}

export async function GET() {
  const fileId = process.env.PARTENAIRES_JSON_ID;

  if (!fileId) {
    return NextResponse.json<PartenairesResponse>({
      data: fallbackPartenaires,
      meta: { stale: true, updatedAt: null },
    });
  }

  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Drive inaccessible");
    }

    const data: unknown = await res.json();

    if (!isValidPartenairesData(data)) {
      throw new Error("Format JSON invalide");
    }

    const cached = await prisma.partenairesCache.upsert({
      where: { id: "default" },
      update: { data },
      create: { id: "default", data },
    });

    return NextResponse.json<PartenairesResponse>({
      data,
      meta: { stale: false, updatedAt: cached.updatedAt.toISOString() },
    });
  } catch {
    try {
      const cached = await prisma.partenairesCache.findUnique({
        where: { id: "default" },
      });

      if (cached && isValidPartenairesData(cached.data)) {
        return NextResponse.json<PartenairesResponse>({
          data: cached.data,
          meta: { stale: true, updatedAt: cached.updatedAt.toISOString() },
        });
      }
    } catch {
      // ignore cache errors and return fallback
    }

    return NextResponse.json<PartenairesResponse>({
      data: fallbackPartenaires,
      meta: { stale: true, updatedAt: null },
    });
  }
}
