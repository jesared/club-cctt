"use client";

import { ChevronDown } from "lucide-react";

import type { MenuSection } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

import SidebarItem from "./SidebarItem";
import { getSidebarPalette } from "./sidebar-palette";

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
  const palette = getSidebarPalette(section.title);

  return (
    <section
      className={cn(
        "rounded-2xl border px-2 py-2 transition-colors",
        open ? palette.sectionExpanded : palette.section,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-background/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center px-1 py-2.5",
        )}
      >
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {section.title}
            </p>
            {section.description ? (
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-4 text-muted-foreground">
                {section.description}
              </p>
            ) : null}
          </div>
        ) : null}

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            !collapsed && "ml-auto",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-1 px-1 pb-1">
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              sectionTitle={section.title}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
