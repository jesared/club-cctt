"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { getClubAccentByHref } from "@/lib/club-context-theme";
import { cn } from "@/lib/utils";

const clubContextLinks = [
  { href: "/club/horaires", label: "Voir les horaires", mobileLabel: "Horaires" },
  { href: "/club/tarifs", label: "Voir les tarifs", mobileLabel: "Tarifs" },
  { href: "/club/contact", label: "Contacter le club", mobileLabel: "Contact" },
  { href: "/club", label: "Decouvrir le club", mobileLabel: "Decouvrir" },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export default function ClubContextNav() {
  const pathname = usePathname();

  return (
    <>
      <div
        aria-label="Navigation club"
        className="grid w-full grid-cols-2 gap-2 sm:hidden"
      >
        {clubContextLinks.map((item) => {
          const active = isActive(pathname, item.href);
          const accent = getClubAccentByHref(item.href);

          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "outline" : "ghost"}
              className={cn(
                "h-11 rounded-xl px-3 text-xs font-semibold shadow-none",
                active
                  ? accent.activeButtonClassName
                  : accent.inactiveButtonClassName,
              )}
            >
              <Link href={item.href}>{item.mobileLabel}</Link>
            </Button>
          );
        })}
      </div>

      <ButtonGroup
        aria-label="Navigation club"
        className="hidden w-full min-w-0 bg-transparent p-0 shadow-none sm:flex sm:w-fit"
      >
        {clubContextLinks.flatMap((item, index) => {
          const active = isActive(pathname, item.href);
          const accent = getClubAccentByHref(item.href);

          return [
            <Button
              key={item.href}
              asChild
              variant={active ? "outline" : "ghost"}
              className={cn(
                "h-10 min-w-0 flex-1 rounded-xl px-4 text-sm font-semibold shadow-none sm:min-w-[11.5rem]",
                active
                  ? accent.activeButtonClassName
                  : accent.inactiveButtonClassName,
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>,
            index < clubContextLinks.length - 1 ? (
              <ButtonGroupSeparator
                key={`${item.href}-separator`}
                className="mx-px hidden sm:block"
              />
            ) : null,
          ];
        })}
      </ButtonGroup>
    </>
  );
}
