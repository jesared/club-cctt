const WEB_REGISTRATION_OWNER_EMAIL = "inscriptions-web@cctt.local";

type PaymentGroupingRegistration = {
  id: string;
  tournamentId: string;
  contactEmail: string | null;
  contactPhone: string | null;
  player: {
    nom?: string;
    prenom?: string;
    ownerId: string;
    owner: {
      name: string | null;
      email: string | null;
    };
  };
};

export function normalizeGroupValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().toLowerCase();
}

function isWebRegistrationOwner(email: string | null | undefined) {
  return normalizeGroupValue(email) === WEB_REGISTRATION_OWNER_EMAIL;
}

export function getPaymentGroupKey(registration: PaymentGroupingRegistration) {
  if (
    registration.player.ownerId &&
    !isWebRegistrationOwner(registration.player.owner.email)
  ) {
    return `owner:${registration.tournamentId}:${registration.player.ownerId}`;
  }

  const normalizedEmail = normalizeGroupValue(registration.contactEmail);
  const normalizedPhone = normalizeGroupValue(registration.contactPhone);
  const contactKey =
    normalizedEmail || normalizedPhone || `registration:${registration.id}`;

  return `contact:${registration.tournamentId}:${contactKey}`;
}

export function getPaymentPayerInfo(registration: PaymentGroupingRegistration) {
  if (
    registration.player.ownerId &&
    !isWebRegistrationOwner(registration.player.owner.email)
  ) {
    return {
      name:
        registration.player.owner.name?.trim() ||
        registration.player.owner.email?.trim() ||
        "Payeur inconnu",
      email: registration.player.owner.email,
      phone: registration.contactPhone,
    };
  }

  return {
    name:
      `${registration.player.prenom ?? ""} ${registration.player.nom ?? ""}`.trim() ||
      registration.contactEmail?.trim() ||
      "Payeur contact",
    email: registration.contactEmail,
    phone: registration.contactPhone,
  };
}

export function buildPayerLabel(
  email: string | null | undefined,
  phone: string | null | undefined,
) {
  if (email && phone) {
    return `${email} / ${phone}`;
  }

  if (email) {
    return email;
  }

  if (phone) {
    return phone;
  }

  return "Contact manquant";
}
