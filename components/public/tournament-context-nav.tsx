"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

const tournamentContextLinks = [
  { href: "/tournoi", label: "Accueil tournoi" },
  { href: "/tournoi/inscription", label: "Inscription" },
  { href: "/tournoi/liste-inscrits", label: "Inscrits" },
  { href: "/tournoi/resultats", label: "Resultats" },
  { href: "/tournoi/palmares", label: "Palmares" },
  { href: "/tournoi/affiches", label: "Affiches" },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export default function TournamentContextNav() {
  const pathname = usePathname();

  return (
    <ButtonGroup
      aria-label="Navigation tournoi"
      className="w-full min-w-0 rounded-2xl border border-border/70 bg-background/90 p-1 shadow-sm lg:w-fit"
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
                ? "border-transparent bg-primary/12 text-primary hover:bg-primary/16 hover:text-primary"
                : "text-muted-foreground hover:bg-primary/6 hover:text-foreground",
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
  );
}
