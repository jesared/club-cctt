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

  const pathSegments = pathname.split("/").filter(Boolean);
  const hrefSegments = href.split("/").filter(Boolean);

  // 👉 doit matcher tous les segments
  const isMatch = hrefSegments.every(
    (segment, index) => pathSegments[index] === segment,
  );

  // ❌ si c'est un parent (moins précis), on refuse
  if (isMatch && pathSegments.length !== hrefSegments.length) {
    return false;
  }

  return isMatch;
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
        "group flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:bg-background hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      {!collapsed && <span className="truncate">{item.label}</span>}

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
