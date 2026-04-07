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
  highlight2Title: "Loisir & competition",
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
  eventImageUrl:
    "https://res.cloudinary.com/diimhrbx7/image/upload/v1774953383/couv-facebook_ktnewg.jpg",
  eventDateLabel: "Avril 2026 - Châlons-en-Champagne",
};

function coerceString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
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
    eventImageUrl: coerceString(
      data.eventImageUrl,
      defaultHomeContent.eventImageUrl,
    ),
    eventDateLabel: coerceString(
      data.eventDateLabel,
      defaultHomeContent.eventDateLabel,
    ),
  };
}
