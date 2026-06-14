export type ClubContextAccent = {
  activeButtonClassName: string;
  inactiveButtonClassName: string;
  cardHoverClassName: string;
  cardPillClassName: string;
  cardLinkClassName: string;
};

const blueAccent: ClubContextAccent = {
  activeButtonClassName:
    "border-transparent bg-[#2F6BFF]/12 text-[#2F6BFF] hover:bg-[#2F6BFF]/16 hover:text-[#2F6BFF]",
  inactiveButtonClassName:
    "border border-border/70 bg-background/90 text-[#2F6BFF]/80 hover:bg-[#2F6BFF]/6 hover:text-[#2F6BFF]",
  cardHoverClassName: "hover:border-[#2F6BFF]/80",
  cardPillClassName:
    "border border-[#2F6BFF]/30 bg-[#2F6BFF]/10 text-[#2F6BFF]",
  cardLinkClassName: "text-[#2F6BFF]",
};

const cyanAccent: ClubContextAccent = {
  activeButtonClassName:
    "border-transparent bg-[#00D9FF]/12 text-[#00B8D9] hover:bg-[#00D9FF]/16 hover:text-[#00B8D9]",
  inactiveButtonClassName:
    "border border-border/70 bg-background/90 text-[#00B8D9] hover:bg-[#00D9FF]/6 hover:text-[#00B8D9]",
  cardHoverClassName: "hover:border-[#00D9FF]/80",
  cardPillClassName:
    "border border-[#00D9FF]/30 bg-[#00D9FF]/10 text-[#00B8D9]",
  cardLinkClassName: "text-[#00B8D9]",
};

const pinkAccent: ClubContextAccent = {
  activeButtonClassName:
    "border-transparent bg-[#FF2E88]/12 text-[#FF2E88] hover:bg-[#FF2E88]/16 hover:text-[#FF2E88]",
  inactiveButtonClassName:
    "border border-border/70 bg-background/90 text-[#FF2E88] hover:bg-[#FF2E88]/6 hover:text-[#FF2E88]",
  cardHoverClassName: "hover:border-[#FF2E88]/80",
  cardPillClassName:
    "border border-[#FF2E88]/30 bg-[#FF2E88]/10 text-[#FF2E88]",
  cardLinkClassName: "text-[#FF2E88]",
};

const clubAccentByHref: Record<string, ClubContextAccent> = {
  "/club": blueAccent,
  "/club/tarifs": blueAccent,
  "/club/horaires": cyanAccent,
  "/club/contact": pinkAccent,
};

export function getClubAccentByHref(href: string) {
  return clubAccentByHref[href] ?? blueAccent;
}
