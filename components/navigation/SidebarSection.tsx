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
  const groupedItems = section.items.reduce<
    Array<{ group: string; items: typeof section.items }>
  >((acc, item) => {
    const group = item.group ?? "";
    const existingGroup = acc.find((entry) => entry.group === group);

    if (existingGroup) {
      existingGroup.items.push(item);
      return acc;
    }

    acc.push({ group, items: [item] });
    return acc;
  }, []);

  return (
    <section
      className={cn(
        "relative rounded-[1.4rem] border px-1.5 py-1.5 transition-all duration-200",
        open ? palette.sectionExpanded : palette.section,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-5 top-0 h-px opacity-70 transition-opacity duration-200",
          palette.sectionGlow,
          open ? "opacity-90" : "opacity-45",
        )}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center rounded-[1.05rem] px-2.5 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center px-1 py-2.5",
        )}
      >
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-foreground">
              {section.title}
            </p>
            {section.description ? (
              <p className="mt-1 line-clamp-2 text-[11px] leading-[1.45] text-muted-foreground/88">
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
        <div className="space-y-1.5 px-0.5 pb-0.5 pt-0.5">
          {groupedItems.map((group) => (
            <div key={group.group || "default"} className="space-y-1">
              {!collapsed && group.group ? (
                <div className="px-2.5 pt-2">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/75">
                    {group.group}
                  </p>
                </div>
              ) : null}

              {group.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  sectionTitle={section.title}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
