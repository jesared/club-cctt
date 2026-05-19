export type TarifLigne = {
  nom: string;
  prix: string;
  highlight?: boolean;
};

export type TarifBloc = {
  categorie: string;
  details?: string;
  lignes: TarifLigne[];
};

export type TarifsData = {
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

export type TarifsSource = "admin" | "drive" | "fallback";

export type TarifsResponse = {
  data: TarifsData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
    source: TarifsSource;
  };
};

export const defaultTarifsContent: TarifsData = {
  blocs: [
    {
      categorie: "Adultes",
      details: "(Vétérans & Senior)",
      lignes: [
        { nom: "Promotionnelle", prix: "140 €" },
        { nom: "Compétition", prix: "184 €", highlight: true },
        { nom: "Compétition + Critérium fédéral", prix: "226 €" },
      ],
    },
    {
      categorie: "Juniors",
      details: "(2007-2010)",
      lignes: [
        { nom: "Promotionnelle", prix: "140 €" },
        { nom: "Compétition", prix: "184 €", highlight: true },
        { nom: "Compétition + Critérium fédéral", prix: "207 €" },
      ],
    },
    {
      categorie: "Cadets & Minimes",
      details: "(2011-2014)",
      lignes: [
        { nom: "Promotionnelle", prix: "130 €" },
        { nom: "Compétition", prix: "158 €", highlight: true },
        { nom: "Compétition + Critérium fédéral", prix: "181 €" },
      ],
    },
    {
      categorie: "Poussins & Benjamins",
      details: "(2015 et après)",
      lignes: [
        { nom: "Promotionnelle", prix: "130 €" },
        { nom: "Compétition", prix: "158 €", highlight: true },
        { nom: "Compétition + Critérium fédéral", prix: "168 €" },
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
    "L'accès aux entraînements",
    "L'encadrement sportif",
    "La participation à la vie du club",
  ],
  inscription: {
    titre: "Modalités d'inscription",
    description:
      "Pour toute inscription ou demande de renseignement, merci de nous contacter. Les tarifs peuvent évoluer selon les catégories et les situations particulières.",
    ctaLabel: "Nous contacter",
    ctaHref: "/club/contact",
  },
};

const LEGACY_TARIFS_TEXT_FIXES = new Map<string, string>([
  ["Je decouvre le club", "Je découvre le club"],
  ["Decouvrir le club", "Découvrir le club"],
  ["Je joue deja regulierement", "Je joue déjà régulièrement"],
  ["Moyens de paiement acceptes", "Moyens de paiement acceptés"],
  ["Cheque ou numeraire", "Chèque ou numéraire"],
  ["Cheques-vacances", "Chèques-vacances"],
  ["Cheques ACTOBI", "Chèques ACTOBI"],
  [
    "PASS SPORT : le dispositif PASS SPORT est accepte par le club.",
    "PASS SPORT : le dispositif PASS SPORT est accepté par le club.",
  ],
  [
    "Possibilite de regler la cotisation en plusieurs fois.",
    "Possibilité de régler la cotisation en plusieurs fois.",
  ],
  ["L'acces aux entrainements", "L'accès aux entraînements"],
  ["La participation a la vie du club", "La participation à la vie du club"],
  ["Modalites d'inscription", "Modalités d'inscription"],
  [
    "Pour toute inscription ou demande de renseignement, merci de nous contacter. Les tarifs peuvent evoluer selon les categories et les situations particulieres.",
    "Pour toute inscription ou demande de renseignement, merci de nous contacter. Les tarifs peuvent évoluer selon les catégories et les situations particulières.",
  ],
  ["Competition", "Compétition"],
  ["Competition + Criterium Federal", "Compétition + Critérium fédéral"],
  ["(Veterans & Senior)", "(Vétérans & Senior)"],
  ["(2015 et apres)", "(2015 et après)"],
]);

function coerceString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();
  return LEGACY_TARIFS_TEXT_FIXES.get(normalizedValue) ?? normalizedValue;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTarifLigne(value: unknown): TarifLigne | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const ligne = {
    nom: coerceString(value.nom),
    prix: coerceString(value.prix),
    highlight: value.highlight === true,
  };

  return ligne.nom || ligne.prix ? ligne : null;
}

function normalizeTarifBloc(value: unknown): TarifBloc | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const lignes = Array.isArray(value.lignes)
    ? value.lignes
        .map((ligne) => normalizeTarifLigne(ligne))
        .filter((ligne): ligne is TarifLigne => ligne !== null)
    : [];

  const bloc = {
    categorie: coerceString(value.categorie),
    details: coerceString(value.details) || undefined,
    lignes,
  };

  return bloc.categorie || bloc.details || bloc.lignes.length > 0 ? bloc : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => coerceString(item))
    .filter((item) => item.length > 0);
}

export function normalizeTarifsContent(
  value: Partial<TarifsData> | null | undefined,
): TarifsData {
  const data = value ?? {};

  return {
    blocs: Array.isArray(data.blocs)
      ? data.blocs
          .map((bloc) => normalizeTarifBloc(bloc))
          .filter((bloc): bloc is TarifBloc => bloc !== null)
      : defaultTarifsContent.blocs,
    paiement: {
      titre:
        coerceString(data.paiement?.titre) || defaultTarifsContent.paiement.titre,
      lignes: normalizeStringArray(data.paiement?.lignes),
      mentions: normalizeStringArray(data.paiement?.mentions),
    },
    inclus: normalizeStringArray(data.inclus),
    inscription: {
      titre:
        coerceString(data.inscription?.titre) ||
        defaultTarifsContent.inscription.titre,
      description:
        coerceString(data.inscription?.description) ||
        defaultTarifsContent.inscription.description,
      ctaLabel:
        coerceString(data.inscription?.ctaLabel) ||
        defaultTarifsContent.inscription.ctaLabel,
      ctaHref:
        coerceString(data.inscription?.ctaHref) ||
        defaultTarifsContent.inscription.ctaHref,
    },
  };
}

export function isValidTarifsData(value: unknown): value is TarifsData {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.blocs) &&
    isObjectRecord(value.paiement) &&
    Array.isArray(value.inclus) &&
    isObjectRecord(value.inscription)
  );
}
