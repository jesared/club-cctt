export type RegistrationPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  points?: string;
  gender?: string;
  club?: string;
  tables?: unknown;
  waitlistTables?: unknown;
  website?: string;
};

export type NormalizedRegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  points: string;
  pointsNumber: number;
  gender: string;
  club: string;
  tables: string[];
  waitlistTables: string[];
  website: string;
};

export type ValidationResult =
  | { ok: true; payload: NormalizedRegistrationPayload }
  | { ok: false; message: string };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeTables(tables: unknown) {
  if (!Array.isArray(tables)) {
    return [];
  }

  return tables
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toUpperCase())
    .filter(
      (value, index, current) =>
        value.length > 0 && current.indexOf(value) === index,
    )
    .slice(0, 6);
}

function normalizeWaitlistTables(tables: string[], waitlistTables: unknown) {
  if (!Array.isArray(waitlistTables)) {
    return [];
  }

  const normalizedWaitlist = waitlistTables
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toUpperCase())
    .filter(
      (value, index, current) =>
        value.length > 0 && current.indexOf(value) === index,
    );

  return normalizedWaitlist.filter((value) => tables.includes(value));
}

export function validateAndNormalizeRegistration(
  body: RegistrationPayload,
): ValidationResult {
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const licenseNumber = body.licenseNumber?.trim() ?? "";
  const points = body.points?.trim() ?? "";
  const gender = body.gender?.trim().toUpperCase() ?? "";
  const club = body.club?.trim() ?? "";
  const website = body.website?.trim() ?? "";
  const tables = normalizeTables(body.tables);
  const waitlistTables = normalizeWaitlistTables(tables, body.waitlistTables);

  if (firstName.length < 2 || firstName.length > 100) {
    return {
      ok: false,
      message: "Le prenom doit contenir entre 2 et 100 caracteres.",
    };
  }

  if (lastName.length < 2 || lastName.length > 100) {
    return {
      ok: false,
      message: "Le nom doit contenir entre 2 et 100 caracteres.",
    };
  }

  if (!isValidEmail(email) || email.length > 150) {
    return { ok: false, message: "Adresse email invalide." };
  }

  if (phone.length < 10 || phone.length > 20) {
    return {
      ok: false,
      message:
        "Le numero de telephone doit contenir entre 10 et 20 caracteres.",
    };
  }

  if (licenseNumber.length < 6 || licenseNumber.length > 20) {
    return {
      ok: false,
      message: "Le numero de licence doit contenir entre 6 et 20 caracteres.",
    };
  }

  if (club.length < 2 || club.length > 120) {
    return {
      ok: false,
      message: "Le nom du club doit contenir entre 2 et 120 caracteres.",
    };
  }

  if (!/^\d{1,5}$/.test(points)) {
    return {
      ok: false,
      message: "Les points doivent etre un nombre positif.",
    };
  }

  if (!["M", "F"].includes(gender)) {
    return { ok: false, message: "Le genre doit etre M ou F." };
  }

  if (tables.length === 0) {
    return {
      ok: false,
      message: "Merci de selectionner au moins un tableau.",
    };
  }

  const pointsNumber = Number.parseInt(points, 10);

  return {
    ok: true,
    payload: {
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      points,
      pointsNumber,
      gender,
      club,
      tables,
      waitlistTables,
      website,
    },
  };
}

export function getInvalidTables(
  selectedEvents: Array<{
    code: string;
    gender: string | null;
    minPoints: number | null;
    maxPoints: number | null;
  }>,
  payload: NormalizedRegistrationPayload,
) {
  return selectedEvents
    .filter((event) => {
      if (event.gender === "F" && payload.gender !== "F") {
        return true;
      }

      if (event.gender === "M" && payload.gender !== "M") {
        return true;
      }

      if (event.minPoints !== null && payload.pointsNumber < event.minPoints) {
        return true;
      }

      if (event.maxPoints !== null && payload.pointsNumber > event.maxPoints) {
        return true;
      }

      return false;
    })
    .map((event) => event.code);
}
