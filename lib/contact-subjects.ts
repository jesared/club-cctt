export const contactSubjectOptions = [
  "Demander un essai",
  "Question sur les tarifs",
  "Question sur les horaires",
  "Autre demande",
] as const;

export type ContactSubject = (typeof contactSubjectOptions)[number];

export const contactMotives: Array<{
  title: ContactSubject;
  detail: string;
}> = [
  {
    title: "Demander un essai",
    detail:
      "Pour venir découvrir le club, tester un créneau et être orienté selon votre profil.",
  },
  {
    title: "Question sur les tarifs",
    detail:
      "Pour comprendre la bonne formule, ce qui est inclus et les modalités de paiement.",
  },
  {
    title: "Question sur les horaires",
    detail:
      "Pour savoir quel créneau choisir selon l'âge, le niveau ou le rythme souhaité.",
  },
  {
    title: "Autre demande",
    detail:
      "Pour toute question générale, partenariat, tournoi ou demande spécifique.",
  },
];

export function isContactSubject(value: unknown): value is ContactSubject {
  return (
    typeof value === "string" &&
    contactSubjectOptions.includes(value as ContactSubject)
  );
}

export function normalizeContactSubject(value: unknown): ContactSubject | "" {
  return isContactSubject(value) ? value : "";
}
