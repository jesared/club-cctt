import { ctaToneClasses, type CtaTone } from "@/lib/cta-theme";

export type ClubContextAccent = {
  activeButtonClassName: string;
  inactiveButtonClassName: string;
  cardHoverClassName: string;
  cardPillClassName: string;
  cardLinkClassName: string;
};

function buildAccent(tone: CtaTone): ClubContextAccent {
  const classes = ctaToneClasses[tone];

  return {
    activeButtonClassName: `border-transparent ${classes.softButton}`,
    inactiveButtonClassName: `border border-border/70 bg-background/90 ${classes.link} hover:bg-accent/40`,
    cardHoverClassName: classes.cardHover,
    cardPillClassName: `border ${classes.eyebrow}`,
    cardLinkClassName: classes.link,
  };
}

const blueAccent = buildAccent("club");
const cyanAccent = buildAccent("schedule");
const pinkAccent = buildAccent("contact");

const clubAccentByHref: Record<string, ClubContextAccent> = {
  "/club": blueAccent,
  "/club/tarifs": blueAccent,
  "/club/horaires": cyanAccent,
  "/club/contact": pinkAccent,
};

export function getClubAccentByHref(href: string) {
  return clubAccentByHref[href] ?? blueAccent;
}
