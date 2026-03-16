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
};

type SidebarProps = {
  items: SidebarItem[];
  title?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export default function Sidebar({
  items,
  title = "Navigation",
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

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
          <SheetContent side="left" className="w-[280px] p-3">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1" aria-label={title}>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "relative hidden h-screen border-r border-border bg-card transition-all duration-300 md:flex md:flex-col",
          collapsed ? "w-[72px]" : "w-[240px]",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute top-4 right-[-12px] z-10 hidden h-7 w-7 rounded-full md:inline-flex"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Ouvrir la sidebar" : "Replier la sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <SidebarDesktop items={items} collapsed={collapsed} />
      </aside>
    </>
  );
}

function SidebarDesktop({ items, collapsed }: { items: SidebarItem[]; collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={100}>
      <nav className="flex flex-col gap-1 p-3 pt-14" aria-label="Navigation desktop">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 hover:bg-accent",
                collapsed ? "justify-center" : "gap-2",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
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
      </nav>
    </TooltipProvider>
  );
}
