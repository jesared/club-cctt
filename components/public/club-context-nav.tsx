"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      className="rounded-2xl border border-border/70 bg-muted/20 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        {clubContextLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 bg-background/80 text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
