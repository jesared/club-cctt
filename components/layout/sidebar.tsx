"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
};

type SidebarProps = {
  items: SidebarItem[];
  title?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  userSection?: ReactNode;
};

export default function Sidebar({
  items,
  title = "Navigation",
  collapsed,
  onToggleCollapsed,
  userSection,
}: SidebarProps) {
  const groupedItems = groupItemsBySection(items);

  return (
    <>
      <div className="mb-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <PanelLeft className="h-4 w-4" />
              {title}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-4">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <MobileSidebarNav title={title} groupedItems={groupedItems} />
            {userSection ? <div className="mt-4 border-t pt-4">{userSection}</div> : null}
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "relative hidden h-screen border-r bg-card p-4 md:flex md:flex-col",
          collapsed ? "w-[84px]" : "w-[240px]",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute right-[-12px] top-4 z-10 hidden h-7 w-7 rounded-full md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Ouvrir la sidebar" : "Replier la sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <DesktopSidebarNav groupedItems={groupedItems} collapsed={collapsed} title={title} />
        {userSection ? <div className="mt-auto border-t pt-4">{userSection}</div> : null}
      </aside>
    </>
  );
}

function MobileSidebarNav({
  title,
  groupedItems,
}: {
  title: string;
  groupedItems: Array<{ section: string; items: SidebarItem[] }>;
}) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-col gap-4" aria-label={title}>
      {groupedItems.map((group) => (
        <div key={group.section} className="space-y-1">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.section}
          </p>
          {group.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200 hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function DesktopSidebarNav({
  groupedItems,
  collapsed,
  title,
}: {
  groupedItems: Array<{ section: string; items: SidebarItem[] }>;
  collapsed: boolean;
  title: string;
}) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={100}>
      <nav className="flex flex-1 flex-col gap-4" aria-label={title}>
        {groupedItems.map((group) => (
          <div key={group.section} className="space-y-1">
            <p
              className={cn(
                "px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                collapsed && "text-center",
              )}
            >
              <span className={collapsed ? "sr-only" : ""}>{group.section}</span>
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200 hover:bg-accent",
                    isActive && "bg-primary text-primary-foreground",
                    collapsed && "justify-center px-2",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
                </Link>
              );

              if (!collapsed) {
                return link;
              }

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}

function groupItemsBySection(items: SidebarItem[]) {
  const groups = new Map<string, SidebarItem[]>();

  for (const item of items) {
    const section = item.section ?? "Navigation";
    const sectionItems = groups.get(section) ?? [];
    sectionItems.push(item);
    groups.set(section, sectionItems);
  }

  return Array.from(groups.entries()).map(([section, groupItems]) => ({
    section,
    items: groupItems,
  }));
}
