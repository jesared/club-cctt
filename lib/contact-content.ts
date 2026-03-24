export type ContactContentData = {
  title: string;
  subtitle: string;
  intro: string;
  email: string;
  responseDelay: string;
  addressName: string;
  addressLine: string;
  addressCity: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export const defaultContactContent: ContactContentData = {
  title: "Parlons de votre projet ou de votre inscription",
  subtitle: "Contact",
  intro:
    "Une question sur les horaires, les tarifs ou la pratique ? Écrivez-nous et nous vous répondons rapidement.",
  email: "communication@cctt.fr",
  responseDelay: "Réponse habituelle sous 24h à 72h.",
  addressName: "Salle Tirlet",
  addressLine: "Châlons-en-Champagne Tennis de Table",
  addressCity: "Châlons-en-Champagne",
  ctaPrimaryLabel: "Voir les horaires",
  ctaPrimaryHref: "/club/horaires",
  ctaSecondaryLabel: "Consulter les tarifs",
  ctaSecondaryHref: "/club/tarifs",
};

function coerceString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
}

export function normalizeContactContent(
  value: Partial<ContactContentData> | null | undefined,
): ContactContentData {
  const data = value ?? {};

  return {
    title: coerceString(data.title, defaultContactContent.title),
    subtitle: coerceString(data.subtitle, defaultContactContent.subtitle),
    intro: coerceString(data.intro, defaultContactContent.intro),
    email: coerceString(data.email, defaultContactContent.email),
    responseDelay: coerceString(
      data.responseDelay,
      defaultContactContent.responseDelay,
    ),
    addressName: coerceString(
      data.addressName,
      defaultContactContent.addressName,
    ),
    addressLine: coerceString(
      data.addressLine,
      defaultContactContent.addressLine,
    ),
    addressCity: coerceString(
      data.addressCity,
      defaultContactContent.addressCity,
    ),
    ctaPrimaryLabel: coerceString(
      data.ctaPrimaryLabel,
      defaultContactContent.ctaPrimaryLabel,
    ),
    ctaPrimaryHref: coerceString(
      data.ctaPrimaryHref,
      defaultContactContent.ctaPrimaryHref,
    ),
    ctaSecondaryLabel: coerceString(
      data.ctaSecondaryLabel,
      defaultContactContent.ctaSecondaryLabel,
    ),
    ctaSecondaryHref: coerceString(
      data.ctaSecondaryHref,
      defaultContactContent.ctaSecondaryHref,
    ),
  };
}
