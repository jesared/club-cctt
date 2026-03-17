"use client";

import { ChevronLeft, EyeOff, LayoutPanelLeft } from "lucide-react";
import Link from "next/link";

import AuthButton from "@/components/AuthButton";
import SidebarSection from "@/components/navigation/SidebarSection";
import { primaryCta, type MenuSection } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type SidebarState = "expanded" | "collapsed" | "hidden";

type SidebarProps = {
  sections: MenuSection[];
  openSections: Record<string, boolean>;
  onToggleSection: (sectionTitle: string) => void;
  sidebarState: SidebarState;
  onToggleCollapse: () => void;
  onHide: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function SidebarContent({
  sections,
  collapsed,
  openSections,
  onToggleSection,
  onNavigate,
}: {
  sections: MenuSection[];
  collapsed: boolean;
  openSections: Record<string, boolean>;
  onToggleSection: (sectionTitle: string) => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="app-scroll flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {sections.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            collapsed={collapsed}
            open={Boolean(openSections[section.title])}
            onToggle={() => onToggleSection(section.title)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="space-y-3 border-t p-3">
        {!collapsed && (
          <Link
            href={primaryCta.href}
            onClick={onNavigate}
            className="block rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            {primaryCta.label}
          </Link>
        )}
        <AuthButton collapsed={collapsed} />
      </div>
    </>
  );
}

export default function Sidebar({
  sections,
  openSections,
  onToggleSection,
  sidebarState,
  onToggleCollapse,
  onHide,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const collapsed = sidebarState === "collapsed";
  const hidden = sidebarState === "hidden";

  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 border-r bg-card transition-[width,border-color] duration-300 ease-out md:flex md:flex-col",
          hidden ? "w-0 border-transparent" : collapsed ? "w-[72px]" : "w-[240px]",
        )}
      >
        <div
          className={cn(
            "flex h-full min-h-0 flex-col transition-opacity duration-200",
            hidden && "pointer-events-none opacity-0",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b px-2">
            {!collapsed && <p className="px-1 text-sm font-semibold">Navigation</p>}
            <div className="flex items-center">
              <Button
                size="icon"
                variant="ghost"
                aria-label={collapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
                onClick={onToggleCollapse}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Masquer la sidebar" onClick={onHide}>
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <SidebarContent
            sections={sections}
            collapsed={collapsed}
            openSections={openSections}
            onToggleSection={onToggleSection}
          />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[300px] p-0 md:hidden">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-left">
              <LayoutPanelLeft className="h-4 w-4" />
              Navigation
            </SheetTitle>
          </SheetHeader>

          <div className="flex h-full min-h-0 flex-col">
            <SidebarContent
              sections={sections}
              collapsed={false}
              openSections={openSections}
              onToggleSection={onToggleSection}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
