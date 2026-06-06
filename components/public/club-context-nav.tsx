"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const clubContextLinks = [
  { href: "/club/horaires", label: "Voir les horaires" },
  { href: "/club/tarifs", label: "Voir les tarifs" },
  { href: "/club/contact", label: "Contacter le club" },
  { href: "/club", label: "Decouvrir le club" },
];

function isActive(pathname: string, href: string) {
  return pathname === href;
}

export default function ClubContextNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation club"
      className="inline-flex w-full flex-col gap-1 rounded-2xl border border-border/70 bg-muted/20 p-1 sm:w-fit sm:flex-row"
    >
      {clubContextLinks.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "outline" : "ghost"}
            className={cn(
              "h-10 rounded-xl px-4 shadow-none",
              active
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
          <Link
            href={item.href}
          >
            {item.label}
          </Link>
          </Button>
        );
      })}
    </nav>
  );
}
