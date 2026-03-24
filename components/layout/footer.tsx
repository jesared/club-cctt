"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { isPublicRoute } from "@/lib/routes";

export default function Footer() {
  const pathname = usePathname();

  if (!isPublicRoute(pathname)) {
    return null;
  }

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} CCTT</span>
        <div className="flex items-center gap-4">
          <Link href="/club/contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/tournoi" className="hover:text-foreground">
            Tournoi
          </Link>
          <Link href="/club" className="hover:text-foreground">
            Club
          </Link>
        </div>
      </div>
    </footer>
  );
}
