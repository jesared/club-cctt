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
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type SidebarProps = {
  items: SidebarItem[];
  title?: string;
};

export default function Sidebar({ items, title = "Navigation" }: SidebarProps) {
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
            <nav className="mt-4 flex flex-col gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
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

      <aside className="hidden h-screen border-r bg-card p-3 md:flex md:flex-col md:gap-1 md:transition-[width] md:duration-200 md:ease-in-out md:group-data-[collapsed=true]:w-[72px] md:group-data-[collapsed=false]:w-[240px]">
        <SidebarDesktop items={items} />
      </aside>
    </>
  );
}

function SidebarDesktop({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent",
              "group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2",
              isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="group-data-[collapsed=true]:hidden">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function SidebarCollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="hidden md:inline-flex"
      onClick={onToggle}
      aria-label={collapsed ? "Ouvrir la sidebar" : "Replier la sidebar"}
    >
      {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  );
}
