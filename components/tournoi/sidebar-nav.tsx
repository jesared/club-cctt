"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { tournamentMenuItems } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

export default function TournoiSidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="tournament-panel h-fit rounded-2xl border p-4 md:sticky md:top-24">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Menu tournoi
      </p>
      <nav aria-label="Navigation tournoi">
        <ul className="flex flex-col gap-2">
          {tournamentMenuItems.map((item) => {
            const isTournoiHome = item.href === "/tournoi";
            const active = isTournoiHome
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                    "hover:border-primary/40 hover:bg-primary/10",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-transparent text-muted-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
