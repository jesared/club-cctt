"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

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

type SidebarGroup = {
  group: string;
  items: MenuSection["items"];
};

function getActiveGroup(groups: SidebarGroup[], pathname: string) {
  let activeGroup: string | undefined;
  let activeHrefLength = -1;

  for (const group of groups) {
    for (const item of group.items) {
      const itemIsActive =
        pathname === item.href || pathname.startsWith(`${item.href}/`);

      if (itemIsActive && item.href.length > activeHrefLength) {
        activeGroup = group.group;
        activeHrefLength = item.href.length;
      }
    }
  }

  return activeGroup;
}

export default function SidebarSection({
  section,
  collapsed,
  open,
  onToggle,
  onNavigate,
}: SidebarSectionProps) {
  const pathname = usePathname();
  const groupListId = useId();
  const palette = getSidebarPalette(section.title);
  const groupedItems = useMemo(
    () =>
      section.items.reduce<SidebarGroup[]>((acc, item) => {
        const group = item.group ?? "";
        const existingGroup = acc.find((entry) => entry.group === group);

        if (existingGroup) {
          existingGroup.items.push(item);
          return acc;
        }

        acc.push({ group, items: [item] });
        return acc;
      }, []),
    [section],
  );
  const activeGroup = useMemo(
    () => getActiveGroup(groupedItems, pathname),
    [groupedItems, pathname],
  );
  const activeGroupPathnameRef = useRef(pathname);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    return Object.fromEntries(
      groupedItems.map((group, index) => [
        group.group,
        !group.group || group.group === activeGroup || (!activeGroup && index === 0),
      ]),
    );
  });

  useEffect(() => {
    if (activeGroupPathnameRef.current === pathname) return;

    activeGroupPathnameRef.current = pathname;
    if (!activeGroup) return;

    setOpenGroups(
      Object.fromEntries(
        groupedItems.map((group) => [
          group.group,
          !group.group || group.group === activeGroup,
        ]),
      ),
    );
  }, [activeGroup, groupedItems, pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups((current) =>
      Object.fromEntries(
        groupedItems.map((entry) => [
          entry.group,
          !entry.group || (entry.group === group && !current[group]),
        ]),
      ),
    );
  };

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
          {groupedItems.map((group, groupIndex) => (
            <div key={group.group || "default"} className="space-y-1">
              {!collapsed && group.group ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.group)}
                  aria-expanded={!!openGroups[group.group]}
                  aria-controls={`${groupListId}-${groupIndex}`}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-muted-foreground/75 transition-colors hover:bg-white/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                    {group.group}
                  </span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                      openGroups[group.group] && "rotate-180",
                    )}
                  />
                </button>
              ) : null}

              {collapsed || !group.group || openGroups[group.group] ? (
                <div
                  id={group.group ? `${groupListId}-${groupIndex}` : undefined}
                  className="space-y-1"
                >
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
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
