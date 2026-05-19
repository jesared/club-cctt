"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicMenuVisibility } from "@/lib/menu-settings";
import { isPublicMenuVisible } from "@/lib/menu-settings";
import { isPublicRoute } from "@/lib/routes";

type FooterProps = {
  menuVisibility?: PublicMenuVisibility;
};

export default function Footer({ menuVisibility }: FooterProps) {
  const pathname = usePathname();

  if (!isPublicRoute(pathname)) {
    return null;
  }

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
        <span>
          © {new Date().getFullYear()} CCTT ·{" "}
          <a
            href="https://jesared.fr"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Creation Jerome Henry
          </a>
        </span>
        <div className="flex items-center gap-4">
          <Link href="/club/contact" className="hover:text-foreground">
            Contact
          </Link>
          {isPublicMenuVisible(menuVisibility, "tournoi") ? (
            <Link href="/tournoi" className="hover:text-foreground">
              Tournoi
            </Link>
          ) : null}
          <Link href="/club" className="hover:text-foreground">
            Club
          </Link>
        </div>
      </div>
    </footer>
  );
}
