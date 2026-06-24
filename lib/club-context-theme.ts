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
    activeButtonClassName: `border-transparent ${classes.softButton} hover:ring-1 hover:ring-current/45 focus-visible:ring-1 focus-visible:ring-current/45 dark:border-primary/55 dark:bg-primary/30 dark:text-white dark:hover:bg-primary/45 dark:hover:text-white dark:hover:ring-primary/55`,
    inactiveButtonClassName: `border border-border/70 bg-background/90 ${classes.link} hover:border-primary/60 hover:bg-primary/25 hover:ring-1 hover:ring-primary/25 focus-visible:ring-1 focus-visible:ring-primary/30 dark:hover:border-primary/80 dark:hover:bg-primary/35 dark:hover:text-white dark:hover:ring-primary/45`,
    cardHoverClassName: classes.cardHover,
    cardPillClassName: `border ${classes.eyebrow}`,
    cardLinkClassName: classes.link,
  };
}

const blueAccent = buildAccent("club");
const scheduleAccent = buildAccent("schedule");
const contactAccent = buildAccent("contact");

const clubAccentByHref: Record<string, ClubContextAccent> = {
  "/club": blueAccent,
  "/club/tarifs": blueAccent,
  "/club/horaires": scheduleAccent,
  "/club/contact": contactAccent,
};

export function getClubAccentByHref(href: string) {
  return clubAccentByHref[href] ?? blueAccent;
}
