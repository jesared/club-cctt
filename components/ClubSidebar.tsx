"use client";

import { mainMenuItems } from "@/components/navigation/menu-items";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export default function ClubSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4" aria-label="Navigation club">
      <p className="mb-4 pb-3 text-sm font-semibold">Espace club</p>
      <div className="flex flex-1 flex-col gap-1">
        {mainMenuItems.map((item) => {
          const isClubHome = item.href === "/club";
          const active = isClubHome
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
                "hover:border-primary/40 hover:bg-primary/10",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
