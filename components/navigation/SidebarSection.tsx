"use client";

import { ChevronDown } from "lucide-react";

import type { MenuSection } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

import SidebarItem from "./SidebarItem";

type SidebarSectionProps = {
  section: MenuSection;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

export default function SidebarSection({
  section,
  collapsed,
  open,
  onToggle,
  onNavigate,
}: SidebarSectionProps) {
  return (
    <section className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center rounded-md px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
          "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center px-1",
        )}
      >
        {!collapsed && <span className="truncate">{section.title}</span>}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            !collapsed && "ml-auto",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-1">
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
