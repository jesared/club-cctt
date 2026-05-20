export type BureauMember = {
  poste: string;
  nom: string;
  description: string;
  photo: string;
};

export type SimpleMember = {
  nom: string;
  photo: string;
};

export type ComiteData = {
  bureau: BureauMember[];
  membres: SimpleMember[];
  salaries: SimpleMember[];
};

export type ComiteSource = "admin" | "drive" | "fallback";

export type ComiteResponse = {
  data: ComiteData;
  meta: {
    stale: boolean;
    updatedAt: string | null;
    source: ComiteSource;
  };
};

export const defaultComiteContent: ComiteData = {
  bureau: [],
  membres: [],
  salaries: [],
};

function coerceString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBureauMember(value: unknown): BureauMember | null {
  if (!isObjectRecord(value)) {
    return null;
  }

  const member = {
    poste: coerceString(value.poste),
    nom: coerceString(value.nom),
    description: coerceString(value.description),
    photo: coerceString(value.photo),
  };

  return member.poste || member.nom || member.description || member.photo
    ? member
    : null;
}

function normalizeSimpleMember(value: unknown): SimpleMember | null {
  if (typeof value === "string") {
    const nom = coerceString(value);
    return nom ? { nom, photo: "" } : null;
  }

  if (!isObjectRecord(value)) {
    return null;
  }

  const member = {
    nom: coerceString(value.nom),
    photo: coerceString(value.photo),
  };

  return member.nom || member.photo ? member : null;
}

export function normalizeComiteContent(
  value: Partial<ComiteData> | null | undefined,
): ComiteData {
  const data = value ?? {};

  return {
    bureau: Array.isArray(data.bureau)
      ? data.bureau
          .map((member) => normalizeBureauMember(member))
          .filter((member): member is BureauMember => member !== null)
      : defaultComiteContent.bureau,
    membres: Array.isArray(data.membres)
      ? data.membres
          .map((member) => normalizeSimpleMember(member))
          .filter((member): member is SimpleMember => member !== null)
      : defaultComiteContent.membres,
    salaries: Array.isArray(data.salaries)
      ? data.salaries
          .map((member) => normalizeSimpleMember(member))
          .filter((member): member is SimpleMember => member !== null)
      : defaultComiteContent.salaries,
  };
}

export function isValidComiteData(value: unknown): value is ComiteData {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.bureau) &&
    Array.isArray(value.membres) &&
    Array.isArray(value.salaries)
  );
}
