import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TarifLigne = {
  nom: string;
  prix: string;
  highlight?: boolean;
};

type TarifBloc = {
  categorie: string;
  details?: string;
  lignes: TarifLigne[];
};

type TarifsData = {
  blocs: TarifBloc[];
  paiement: {
    titre: string;
    lignes: string[];
    mentions: string[];
  };
  inclus: string[];
  inscription: {
    titre: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

type TarifsResponse = {
  data: TarifsData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
  };
};

const fallbackTarifs: TarifsData = {
  blocs: [
    {
      categorie: "Adultes",
      details: "(Vétérans & Senior)",
      lignes: [
        { nom: "Promotionnelle", prix: "140 €" },
        { nom: "Compétition", prix: "184 €", highlight: true },
        { nom: "Compétition + Critérium Fédéral", prix: "226 €" },
      ],
    },
    {
      categorie: "Juniors",
      details: "(2007–2010)",
      lignes: [
        { nom: "Promotionnelle", prix: "140 €" },
        { nom: "Compétition", prix: "184 €", highlight: true },
        { nom: "Compétition + Critérium Fédéral", prix: "207 €" },
      ],
    },
    {
      categorie: "Cadets & Minimes",
      details: "(2011–2014)",
      lignes: [
        { nom: "Promotionnelle", prix: "130 €" },
        { nom: "Compétition", prix: "158 €", highlight: true },
        { nom: "Compétition + Critérium Fédéral", prix: "181 €" },
      ],
    },
    {
      categorie: "Poussins & Benjamins",
      details: "(2015 et après)",
      lignes: [
        { nom: "Promotionnelle", prix: "130 €" },
        { nom: "Compétition", prix: "158 €", highlight: true },
        { nom: "Compétition + Critérium Fédéral", prix: "168 €" },
      ],
    },
  ],
  paiement: {
    titre: "Moyens de paiement acceptés",
    lignes: [
      "Chèque ou numéraire",
      "Chèques-vacances",
      "Bons CAF",
      "Chèques ACTOBI",
      "MSA",
    ],
    mentions: [
      "PASS SPORT : le dispositif PASS SPORT est accepté par le club.",
      "Possibilité de régler la cotisation en plusieurs fois.",
    ],
  },
  inclus: [
    "La licence FFTT",
    "L’accès aux entraînements",
    "L’encadrement sportif",
    "La participation à la vie du club",
  ],
  inscription: {
    titre: "Modalités d’inscription",
    description:
      "Pour toute inscription ou demande de renseignement, merci de nous contacter. Les tarifs peuvent évoluer selon les catégories et les situations particulières.",
    ctaLabel: "Nous contacter",
    ctaHref: "/contact",
  },
};

function isValidTarifsData(value: unknown): value is TarifsData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<TarifsData>;

  const blocsValid =
    Array.isArray(data.blocs) &&
    data.blocs.every(
      (bloc) =>
        typeof bloc?.categorie === "string" &&
        (bloc.details === undefined || typeof bloc.details === "string") &&
        Array.isArray(bloc.lignes) &&
        bloc.lignes.every(
          (ligne) =>
            typeof ligne?.nom === "string" &&
            typeof ligne?.prix === "string" &&
            (ligne.highlight === undefined ||
              typeof ligne.highlight === "boolean"),
        ),
    );

  const paiementValid =
    !!data.paiement &&
    typeof data.paiement.titre === "string" &&
    Array.isArray(data.paiement.lignes) &&
    data.paiement.lignes.every((ligne) => typeof ligne === "string") &&
    Array.isArray(data.paiement.mentions) &&
    data.paiement.mentions.every((mention) => typeof mention === "string");

  const inclusValid =
    Array.isArray(data.inclus) &&
    data.inclus.every((item) => typeof item === "string");

  const inscriptionValid =
    !!data.inscription &&
    typeof data.inscription.titre === "string" &&
    typeof data.inscription.description === "string" &&
    typeof data.inscription.ctaLabel === "string" &&
    typeof data.inscription.ctaHref === "string";

  return blocsValid && paiementValid && inclusValid && inscriptionValid;
}

export async function GET() {
  const fileId = process.env.TARIFS_JSON_ID;

  if (!fileId) {
    return NextResponse.json<TarifsResponse>({
      data: fallbackTarifs,
      meta: { stale: true, updatedAt: null },
    });
  }

  try {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("Drive inaccessible");

    const data: unknown = await res.json();

    if (!isValidTarifsData(data)) {
      throw new Error("Format JSON invalide");
    }

    const cached = await prisma.tarifsCache.upsert({
      where: { id: "default" },
      update: { data },
      create: { id: "default", data },
    });

    return NextResponse.json<TarifsResponse>({
      data,
      meta: { stale: false, updatedAt: cached.updatedAt.toISOString() },
    });
  } catch {
    try {
      const cached = await prisma.tarifsCache.findUnique({
        where: { id: "default" },
      });

      if (cached && isValidTarifsData(cached.data)) {
        return NextResponse.json<TarifsResponse>({
          data: cached.data,
          meta: { stale: true, updatedAt: cached.updatedAt.toISOString() },
        });
      }
    } catch {
      // ignore cache errors and return fallback
    }

    return NextResponse.json<TarifsResponse>({
      data: fallbackTarifs,
      meta: { stale: true, updatedAt: null },
    });
  }
}
