"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export default function SidebarNav({
  ariaLabel,
  items,
}: {
  ariaLabel: string;
  items: SidebarNavItem[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4" aria-label={ariaLabel}>
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
              isActive ? "bg-primary text-primary-foreground" : "text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
