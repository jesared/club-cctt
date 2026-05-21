export type BadgeVariant = "jeunes" | "adultes" | "elite" | "loisir" | "libre";

export type Seance = {
  type: BadgeVariant[];
  label: string;
  horaire: string;
};

export type Jour = {
  jour: string;
  seances: Seance[];
};

export type HorairesData = {
  jours: Jour[];
};

export type HorairesSource = "admin" | "drive" | "fallback";

export type HorairesResponse = {
  data: HorairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
    source: HorairesSource;
  };
};

export const badgeVariants: BadgeVariant[] = [
  "jeunes",
  "adultes",
  "elite",
  "loisir",
  "libre",
];

export const defaultHorairesContent: HorairesData = {
  jours: [],
};

function coerceString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBadgeTypes(value: unknown): BadgeVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((type): type is BadgeVariant =>
    badgeVariants.includes(type as BadgeVariant),
  );
}

function normalizeSeance(value: unknown): Seance | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const seance = {
    type: normalizeBadgeTypes(value.type),
    label: coerceString(value.label),
    horaire: coerceString(value.horaire),
  };

  return seance.type.length > 0 || seance.label || seance.horaire ? seance : null;
}

function normalizeJour(value: unknown): Jour | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const seances = Array.isArray(value.seances)
    ? value.seances
        .map((seance) => normalizeSeance(seance))
        .filter((seance): seance is Seance => seance !== null)
    : [];

  const jour = {
    jour: coerceString(value.jour),
    seances,
  };

  return jour.jour || jour.seances.length > 0 ? jour : null;
}

export function normalizeHorairesContent(
  value: Partial<HorairesData> | null | undefined,
): HorairesData {
  const data = value ?? {};

  return {
    jours: Array.isArray(data.jours)
      ? data.jours
          .map((jour) => normalizeJour(jour))
          .filter((jour): jour is Jour => jour !== null)
      : defaultHorairesContent.jours,
  };
}

export function isValidHorairesData(value: unknown): value is HorairesData {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Array.isArray(value.jours);
}
