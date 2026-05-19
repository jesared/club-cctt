export type Partenaire = {
  nom: string;
  description: string;
  logo: string;
  url?: string;
};

export type PartenairesData = {
  institutionnels: Partenaire[];
  prives: Partenaire[];
};

export type PartenairesSource = "admin" | "drive" | "fallback";

export type PartenairesResponse = {
  data: PartenairesData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
    source: PartenairesSource;
  };
};

export const DEFAULT_PARTENAIRE_LOGO = "/partenaires/default-logo.svg";

export const defaultPartenairesContent: PartenairesData = {
  institutionnels: [],
  prives: [],
};

function coerceString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePartenaire(value: unknown): Partenaire | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const partenaire = {
    nom: coerceString(value.nom),
    description: coerceString(value.description),
    logo: coerceString(value.logo),
    url: coerceString(value.url) || undefined,
  };

  return partenaire.nom || partenaire.description || partenaire.logo || partenaire.url
    ? partenaire
    : null;
}

export function normalizePartenairesContent(
  value: Partial<PartenairesData> | null | undefined,
): PartenairesData {
  const data = value ?? {};

  return {
    institutionnels: Array.isArray(data.institutionnels)
      ? data.institutionnels
          .map((partenaire) => normalizePartenaire(partenaire))
          .filter((partenaire): partenaire is Partenaire => partenaire !== null)
      : defaultPartenairesContent.institutionnels,
    prives: Array.isArray(data.prives)
      ? data.prives
          .map((partenaire) => normalizePartenaire(partenaire))
          .filter((partenaire): partenaire is Partenaire => partenaire !== null)
      : defaultPartenairesContent.prives,
  };
}

export function isValidPartenairesData(value: unknown): value is PartenairesData {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Array.isArray(value.institutionnels) && Array.isArray(value.prives);
}

export function resolvePartenaireLogoSrc(logo: string | null | undefined) {
  const normalizedLogo = typeof logo === "string" ? logo.trim() : "";

  if (!normalizedLogo) {
    return DEFAULT_PARTENAIRE_LOGO;
  }

  if (
    normalizedLogo.startsWith("/") ||
    normalizedLogo.startsWith("http://") ||
    normalizedLogo.startsWith("https://")
  ) {
    return normalizedLogo;
  }

  return `/api/drive-image/${normalizedLogo}`;
}
