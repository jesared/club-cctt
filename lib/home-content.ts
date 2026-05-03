export type HomeContentData = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  heroImageUrl: string;
  welcomeTitle: string;
  welcomeText1: string;
  welcomeText2: string;
  highlight1Title: string;
  highlight1Text: string;
  highlight2Title: string;
  highlight2Text: string;
  highlight3Title: string;
  highlight3Text: string;
  ctaTitle: string;
  ctaText: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
  eventTitle: string;
  eventEnabled: boolean;
  eventImageUrl: string;
  eventDateLabel: string;
};

export const DEFAULT_EVENT_IMAGE_URL = "/tournoi-default-cover.svg";

export const defaultHomeContent: HomeContentData = {
  heroTitle: "Châlons-en-Champagne Tennis de Table",
  heroSubtitle:
    "Club de tennis de table à Châlons-en-Champagne - loisirs et compétition, jeunes et adultes.",
  heroCtaLabel: "Voir les horaires",
  heroCtaHref: "/club/horaires",
  heroImageUrl:
    "https://res.cloudinary.com/diimhrbx7/image/upload/v1774952725/600559768_888023470418639_3507961945519905437_n_ayerkl.jpg",
  welcomeTitle: "Bienvenue au CCTT",
  welcomeText1:
    "Le Châlons-en-Champagne Tennis de Table (CCTT) accueille joueurs débutants comme confirmés dans un cadre convivial et structuré.",
  welcomeText2:
    "Encadré par une équipe d'entraîneurs diplômés, le club met l'accent sur la progression, le respect et le plaisir du jeu.",
  highlight1Title: "Tous les niveaux",
  highlight1Text:
    "Enfants, adultes, débutants ou joueurs confirmés : chacun trouve sa place au CCTT.",
  highlight2Title: "Loisir & compétition",
  highlight2Text:
    "Une pratique adaptée à vos objectifs, du loisir à la compétition officielle.",
  highlight3Title: "Esprit club",
  highlight3Text:
    "Convivialité, respect et engagement sont au cœur de la vie du club.",
  ctaTitle: "Envie de nous rejoindre ?",
  ctaText:
    "Venez essayer le tennis de table au sein du club. Les essais sont possibles avant toute inscription.",
  ctaButtonLabel: "Nous contacter",
  ctaButtonHref: "/club/contact",
  eventTitle: "Événement du club",
  eventEnabled: true,
  eventImageUrl: DEFAULT_EVENT_IMAGE_URL,
  eventDateLabel: "Avril 2026 - Châlons-en-Champagne",
};

const LEGACY_HOME_TEXT_FIXES = new Map<string, string>([
  ["Chalons-en-Champagne Tennis de Table", defaultHomeContent.heroTitle],
  [
    "Club de tennis de table a Chalons-en-Champagne - loisirs et competition, jeunes et adultes.",
    defaultHomeContent.heroSubtitle,
  ],
  [
    "Le Chalons-en-Champagne Tennis de Table (CCTT) accueille joueurs debutants comme confirmes dans un cadre convivial et structure.",
    defaultHomeContent.welcomeText1,
  ],
  [
    "Encadre par une equipe d'entraineurs diplomes, le club met l'accent sur la progression, le respect et le plaisir du jeu.",
    defaultHomeContent.welcomeText2,
  ],
  [
    "Enfants, adultes, debutants ou joueurs confirmes : chacun trouve sa place au CCTT.",
    defaultHomeContent.highlight1Text,
  ],
  ["Loisir & competition", defaultHomeContent.highlight2Title],
  [
    "Une pratique adaptee a vos objectifs, du loisir a la competition officielle.",
    defaultHomeContent.highlight2Text,
  ],
  [
    "Convivialite, respect et engagement sont au coeur de la vie du club.",
    defaultHomeContent.highlight3Text,
  ],
  ["Evenement du club", defaultHomeContent.eventTitle],
  ["Avril 2026 - Chalons-en-Champagne", defaultHomeContent.eventDateLabel],
]);

const LEGACY_EVENT_IMAGE_URLS = new Set<string>([
  "/couv-facebook.jpg",
  "https://res.cloudinary.com/diimhrbx7/image/upload/v1774953383/couv-facebook_ktnewg.jpg",
]);

function coerceString(value: unknown, fallback: string) {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  const normalizedValue = value.trim();
  return LEGACY_HOME_TEXT_FIXES.get(normalizedValue) ?? normalizedValue;
}

export function resolveEventImageUrl(value: string | null | undefined) {
  if (typeof value !== "string") {
    return DEFAULT_EVENT_IMAGE_URL;
  }

  const normalizedValue = value.trim();

  if (
    normalizedValue.length === 0 ||
    LEGACY_EVENT_IMAGE_URLS.has(normalizedValue)
  ) {
    return DEFAULT_EVENT_IMAGE_URL;
  }

  return normalizedValue;
}

export function normalizeHomeContent(
  value: Partial<HomeContentData> | null | undefined,
): HomeContentData {
  const data = value ?? {};

  return {
    heroTitle: coerceString(data.heroTitle, defaultHomeContent.heroTitle),
    heroSubtitle: coerceString(data.heroSubtitle, defaultHomeContent.heroSubtitle),
    heroCtaLabel: coerceString(data.heroCtaLabel, defaultHomeContent.heroCtaLabel),
    heroCtaHref: coerceString(data.heroCtaHref, defaultHomeContent.heroCtaHref),
    heroImageUrl: coerceString(data.heroImageUrl, defaultHomeContent.heroImageUrl),
    welcomeTitle: coerceString(data.welcomeTitle, defaultHomeContent.welcomeTitle),
    welcomeText1: coerceString(data.welcomeText1, defaultHomeContent.welcomeText1),
    welcomeText2: coerceString(data.welcomeText2, defaultHomeContent.welcomeText2),
    highlight1Title: coerceString(
      data.highlight1Title,
      defaultHomeContent.highlight1Title,
    ),
    highlight1Text: coerceString(
      data.highlight1Text,
      defaultHomeContent.highlight1Text,
    ),
    highlight2Title: coerceString(
      data.highlight2Title,
      defaultHomeContent.highlight2Title,
    ),
    highlight2Text: coerceString(
      data.highlight2Text,
      defaultHomeContent.highlight2Text,
    ),
    highlight3Title: coerceString(
      data.highlight3Title,
      defaultHomeContent.highlight3Title,
    ),
    highlight3Text: coerceString(
      data.highlight3Text,
      defaultHomeContent.highlight3Text,
    ),
    ctaTitle: coerceString(data.ctaTitle, defaultHomeContent.ctaTitle),
    ctaText: coerceString(data.ctaText, defaultHomeContent.ctaText),
    ctaButtonLabel: coerceString(
      data.ctaButtonLabel,
      defaultHomeContent.ctaButtonLabel,
    ),
    ctaButtonHref: coerceString(
      data.ctaButtonHref,
      defaultHomeContent.ctaButtonHref,
    ),
    eventTitle: coerceString(data.eventTitle, defaultHomeContent.eventTitle),
    eventEnabled:
      typeof data.eventEnabled === "boolean"
        ? data.eventEnabled
        : defaultHomeContent.eventEnabled,
    eventImageUrl: resolveEventImageUrl(data.eventImageUrl),
    eventDateLabel: coerceString(
      data.eventDateLabel,
      defaultHomeContent.eventDateLabel,
    ),
  };
}
