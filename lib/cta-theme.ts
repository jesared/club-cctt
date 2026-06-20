export type CtaTone = "club" | "schedule" | "tournament" | "contact";

export type CtaToneClasses = {
  accentText: string;
  arrowText: string;
  cardHover: string;
  ctaRowHover: string;
  dot: string;
  eyebrow: string;
  iconBubble: string;
  link: string;
  primaryButton: string;
  softButton: string;
  softBorderButton: string;
};

export const ctaToneClasses: Record<CtaTone, CtaToneClasses> = {
  club: {
    accentText: "text-cta-club",
    arrowText: "text-cta-club-muted group-hover:text-cta-club",
    cardHover: "cta-card-hover-club",
    ctaRowHover: "cta-row-hover-club",
    dot: "bg-cta-club",
    eyebrow: "border-cta-club-muted bg-cta-club-soft text-cta-club",
    iconBubble: "text-cta-club",
    link: "text-cta-club",
    primaryButton: "cta-button-primary-cta-club",
    softButton: "cta-button-soft-cta-club",
    softBorderButton: "cta-button-soft-border-cta-club",
  },
  schedule: {
    accentText: "text-cta-schedule",
    arrowText: "text-cta-schedule-muted group-hover:text-cta-schedule",
    cardHover: "cta-card-hover-schedule",
    ctaRowHover: "cta-row-hover-schedule",
    dot: "bg-cta-schedule",
    eyebrow: "border-cta-schedule-muted bg-cta-schedule-soft text-cta-schedule",
    iconBubble: "text-cta-schedule",
    link: "text-cta-schedule",
    primaryButton: "cta-button-primary-cta-schedule",
    softButton: "cta-button-soft-cta-schedule",
    softBorderButton: "cta-button-soft-border-cta-schedule",
  },
  tournament: {
    accentText: "text-cta-tournament",
    arrowText: "text-cta-tournament-muted group-hover:text-cta-tournament",
    cardHover: "cta-card-hover-tournament",
    ctaRowHover: "cta-row-hover-tournament",
    dot: "bg-cta-tournament",
    eyebrow:
      "border-cta-tournament-muted bg-cta-tournament-soft text-cta-tournament",
    iconBubble: "text-cta-tournament",
    link: "text-cta-tournament",
    primaryButton: "cta-button-primary-cta-tournament",
    softButton: "cta-button-soft-cta-tournament",
    softBorderButton: "cta-button-soft-border-cta-tournament",
  },
  contact: {
    accentText: "text-cta-contact",
    arrowText: "text-cta-contact-muted group-hover:text-cta-contact",
    cardHover: "cta-card-hover-contact",
    ctaRowHover: "cta-row-hover-contact",
    dot: "bg-cta-contact",
    eyebrow: "border-cta-contact-muted bg-cta-contact-soft text-cta-contact",
    iconBubble: "text-cta-contact",
    link: "text-cta-contact",
    primaryButton: "cta-button-primary-cta-contact",
    softButton: "cta-button-soft-cta-contact",
    softBorderButton: "cta-button-soft-border-cta-contact",
  },
};
