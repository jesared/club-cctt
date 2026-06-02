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

import { getSidebarPalette } from "./sidebar-palette";

type SidebarItemProps = {
  item: MenuItem;
  collapsed: boolean;
  sectionTitle: string;
  onNavigate?: () => void;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  const pathSegments = pathname.split("/").filter(Boolean);
  const hrefSegments = href.split("/").filter(Boolean);

  const isMatch = hrefSegments.every(
    (segment, index) => pathSegments[index] === segment,
  );

  if (isMatch && pathSegments.length !== hrefSegments.length) {
    return false;
  }

  return isMatch;
}

export default function SidebarItem({
  item,
  collapsed,
  sectionTitle,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = isItemActive(pathname, item.href);
  const palette = getSidebarPalette(sectionTitle);

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-start gap-2.5 rounded-[1rem] px-2.5 py-2.5 text-[13px] transition-all duration-200 before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-full before:opacity-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "before:opacity-100"
          : "text-muted-foreground shadow-none before:opacity-0",
        active ? palette.activeRow : palette.hoverRow,
        collapsed && "justify-center px-1.5 py-2.5 before:hidden",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          active ? palette.activeIcon : palette.icon,
          collapsed && "mt-0 h-8 w-8",
        )}
      >
        <Icon className="h-3 w-3" />
      </span>

      {!collapsed ? (
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium leading-4 tracking-[-0.01em] text-foreground">
            {item.label}
          </span>
          {item.description ? (
            <span
              className={cn(
                "mt-1 block text-[11px] leading-[1.45] transition-opacity duration-200",
                active
                  ? "text-muted-foreground opacity-100"
                  : "text-muted-foreground/80 opacity-72",
              )}
            >
              {item.description}
            </span>
          ) : null}
        </span>
      ) : null}

      {!collapsed && item.badge ? (
        <Badge
          variant="outline"
          className={cn(
            "ml-auto mt-0.5 rounded-full px-1.5 py-0 text-[10px] font-semibold shadow-none",
            palette.badge,
          )}
        >
          {item.badge}
        </Badge>
      ) : null}
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
