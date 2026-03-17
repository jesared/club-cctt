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
      {/* HEADER */}
      <div className="mb-4 border-b pb-3">
        <p className="text-sm font-semibold">Espace tournoi</p>
      </div>

      {/* NAV */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
