"use client";

import { tournamentMenuItems } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TournoiSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4" aria-label="Navigation tournoi">
      <p className="mb-4 pb-3 text-sm font-semibold">Espace tournoi</p>
      <div className="flex flex-1 flex-col gap-1">
        {tournamentMenuItems.map((item) => {
          const isTournoiHome = item.href === "/tournoi";
          const active = isTournoiHome
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                "hover:border-primary/40 hover:bg-primary/10 ",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
