export const runtime = "nodejs";

import { NextResponse } from "next/server";

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
    return NextResponse.json(fallbackPartenaires);
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

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(fallbackPartenaires);
  }
}
