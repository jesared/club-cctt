"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { ctaToneClasses } from "@/lib/cta-theme";
import { cn } from "@/lib/utils";

const tournamentContextLinks = [
  { href: "/tournoi", label: "Accueil tournoi", mobileLabel: "Accueil" },
  { href: "/tournoi/inscription", label: "Inscription", mobileLabel: "Inscription" },
  { href: "/tournoi/liste-inscrits", label: "Inscrits", mobileLabel: "Inscrits" },
  { href: "/tournoi/resultats", label: "Résultats", mobileLabel: "Résultats" },
  { href: "/tournoi/palmares", label: "Palmarès", mobileLabel: "Palmarès" },
  { href: "/tournoi/affiches", label: "Affiches", mobileLabel: "Affiches" },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export default function TournamentContextNav() {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-label="Navigation tournoi"
        className="grid w-full grid-cols-2 gap-2 lg:hidden"
      >
        {tournamentContextLinks.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "outline" : "ghost"}
              className={cn(
                "h-11 rounded-xl px-3 text-xs font-semibold shadow-none",
                active
                  ? `border-transparent ${ctaToneClasses.tournament.softButton} hover:ring-1 hover:ring-current/45 focus-visible:ring-1 focus-visible:ring-current/45 dark:border-primary/55 dark:bg-primary/30 dark:text-white dark:hover:bg-primary/45 dark:hover:text-white dark:hover:ring-primary/55`
                  : `${ctaToneClasses.tournament.link} border border-border/70 bg-background/90 hover:border-primary/60 hover:bg-primary/25 hover:ring-1 hover:ring-primary/25 focus-visible:ring-1 focus-visible:ring-primary/30 dark:hover:border-primary/80 dark:hover:bg-primary/35 dark:hover:text-white dark:hover:ring-primary/45`,
              )}
            >
              <Link href={item.href}>{item.mobileLabel}</Link>
            </Button>
          );
        })}
      </div>

      <ButtonGroup
        aria-label="Navigation tournoi"
        className="hidden w-full min-w-0 bg-transparent p-0 shadow-none lg:flex lg:w-fit"
      >
        {tournamentContextLinks.flatMap((item, index) => {
          const active = isActive(pathname, item.href);

          return [
            <Button
              key={item.href}
              asChild
              variant={active ? "outline" : "ghost"}
              className={cn(
                "h-10 min-w-0 flex-1 rounded-xl px-4 text-sm font-semibold shadow-none lg:min-w-[9.5rem]",
                active
                  ? `border-transparent ${ctaToneClasses.tournament.softButton} hover:ring-1 hover:ring-current/45 focus-visible:ring-1 focus-visible:ring-current/45 dark:border-primary/55 dark:bg-primary/30 dark:text-white dark:hover:bg-primary/45 dark:hover:text-white dark:hover:ring-primary/55`
                  : `${ctaToneClasses.tournament.link} border border-border/70 bg-background/90 hover:border-primary/60 hover:bg-primary/25 hover:ring-1 hover:ring-primary/25 focus-visible:ring-1 focus-visible:ring-primary/30 dark:hover:border-primary/80 dark:hover:bg-primary/35 dark:hover:text-white dark:hover:ring-primary/45`,
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>,
            index < tournamentContextLinks.length - 1 ? (
              <ButtonGroupSeparator
                key={`${item.href}-separator`}
                className="mx-px hidden lg:block"
              />
            ) : null,
          ];
        })}
      </ButtonGroup>
    </>
  );
}
