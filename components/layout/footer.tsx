"use client";

import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicMenuVisibility } from "@/lib/menu-settings";
import { isPublicMenuVisible } from "@/lib/menu-settings";
import { isPublicRoute } from "@/lib/routes";

type FooterProps = {
  menuVisibility?: PublicMenuVisibility;
};

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/chalonstt51/",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/chalonstt51",
    icon: Facebook,
  },
] as const;

export default function Footer({ menuVisibility }: FooterProps) {
  const pathname = usePathname();

  if (!isPublicRoute(pathname)) {
    return null;
  }

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/25">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-center lg:text-left">
          <span className="block">
            © {new Date().getFullYear()} CCTT ·{" "}
            <a
              href="https://jesared.fr"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Creation Jerome Henry
            </a>
          </span>
          <p className="text-[11px] text-muted-foreground/80">
            Club de tennis de table a Chalons-en-Champagne
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            href="/club/contact"
            className="transition-colors hover:text-foreground"
          >
            Contact
          </Link>
          {isPublicMenuVisible(menuVisibility, "tournoi") ? (
            <Link
              href="/tournoi"
              className="transition-colors hover:text-foreground"
            >
              Tournoi
            </Link>
          ) : null}
          <Link href="/club" className="transition-colors hover:text-foreground">
            Club
          </Link>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-3 py-3 text-center shadow-sm backdrop-blur sm:flex-row sm:gap-3 sm:text-left lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/80">
              Suivez-nous
            </p>
            <p className="text-[11px] text-muted-foreground/80">
              @chalonstt51 sur Instagram et Facebook
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} @chalonstt51`}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-2 text-xs font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-background"
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
