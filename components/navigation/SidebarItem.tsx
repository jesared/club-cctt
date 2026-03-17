"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MenuItem } from "@/components/navigation/menu-items";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  item: MenuItem;
  collapsed: boolean;
  onNavigate?: () => void;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  // 🔥 admin global (EXCLUSION tournoi)
  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/tournoi"))
    );
  }

  // 🔥 admin tournoi (prioritaire)
  if (href === "/admin/tournoi") {
    return pathname.startsWith("/admin/tournoi");
  }

  // 👉 default
  return pathname === href || pathname.startsWith(href + "/");
}

export default function SidebarItem({
  item,
  collapsed,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = isItemActive(pathname, item.href);

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",

        // 👉 hover
        "hover:bg-accent/50",

        // 👉 actif
        active
          ? "bg-accent text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground",

        // 👉 collapsed
        collapsed && "justify-center px-2",
      )}
    >
      {/* 🔥 BARRE ACTIVE (style Vercel) */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary transition-all duration-200",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-50",
        )}
      />

      {/* ICON */}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      />

      {/* LABEL */}
      {!collapsed && <span className="truncate">{item.label}</span>}

      {/* BADGE */}
      {!collapsed && item.badge && (
        <Badge
          variant="secondary"
          className="ml-auto rounded-md px-1.5 py-0 text-[10px]"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
