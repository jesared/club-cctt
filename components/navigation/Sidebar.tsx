"use client";

import { ChevronLeft, PanelLeftOpen, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AuthButton from "@/components/AuthButton";
import {
  getVisibleSections,
  primaryCta,
  type MenuSection,
} from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import SidebarSection from "./SidebarSection";

const SIDEBAR_KEY = "app.sidebar.state";
const SECTIONS_KEY = "app.sidebar.sections";

type SidebarState = "expanded" | "collapsed" | "hidden";

type SidebarProps = {
  mobile?: boolean;
  onOpen?: () => void;
};

function buildSectionState(sections: MenuSection[], pathname: string) {
  return sections.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.title] = section.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    return acc;
  }, {});
}

export default function Sidebar({}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sections = useMemo(
    () =>
      getVisibleSections({
        role: session?.user?.role,
        session: session ?? null,
      }),
    [session],
  );

  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const collapsed = sidebarState === "collapsed";

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored) setSidebarState(stored as SidebarState);

    const storedSections = localStorage.getItem(SECTIONS_KEY);
    if (storedSections) {
      try {
        setOpenSections(JSON.parse(storedSections));
        return;
      } catch {}
    }

    setOpenSections(buildSectionState(sections, pathname));
  }, [pathname, sections]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarState);
    window.dispatchEvent(new Event("sidebar:update"));
  }, [sidebarState]);

  useEffect(() => {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const toggleCollapse = () => {
    setSidebarState((prev) =>
      prev === "collapsed" ? "expanded" : "collapsed",
    );
  };

  const reopenSidebar = () => {
    setSidebarState("expanded");
  };

  return (
    <>
      {sidebarState === "hidden" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="fixed left-3 top-20 z-50 gap-2 shadow-md"
          aria-label="Rouvrir la sidebar"
          onClick={reopenSidebar}
        >
          <PanelLeftOpen className="h-4 w-4" />
          <span className="hidden lg:inline">Rouvrir le menu</span>
        </Button>
      )}

      <div
        className={cn(
          "transition-all duration-300",
          sidebarState === "expanded" && "w-[260px]",
          sidebarState === "collapsed" && "w-[72px]",
          sidebarState === "hidden" && "w-0 overflow-hidden",
        )}
      >
        <aside className="mt-14 flex h-full flex-col border-r bg-card">
          <div className="flex h-14 items-center justify-between border-b px-3">
            {!collapsed && <p className="text-sm font-semibold">Navigation</p>}

            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={toggleCollapse}>
                <ChevronLeft
                  className={cn(
                    "h-4 w-4 transition-transform",
                    collapsed && "rotate-180",
                  )}
                />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                aria-label="Masquer la sidebar"
                onClick={() => setSidebarState("hidden")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
            {sections.map((section) => (
              <SidebarSection
                key={section.title}
                section={section}
                collapsed={collapsed}
                open={!!openSections[section.title]}
                onToggle={() => toggleSection(section.title)}
              />
            ))}
          </div>

          <div className="space-y-3 border-t p-3">
            {!collapsed && (
              <Link
                href={primaryCta.href}
                className="block rounded-lg border px-3 py-2 text-center text-sm hover:bg-muted"
              >
                {primaryCta.label}
              </Link>
            )}
            <AuthButton collapsed={collapsed} />
          </div>
        </aside>
      </div>
    </>
  );
}
