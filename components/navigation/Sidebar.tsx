"use client";

import { EyeOff, PanelLeftOpen } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AuthButton from "@/components/AuthButton";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getVisibleSections,
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
function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  // 🔥 cas spécial admin (évite double actif)
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }

  // 👉 évite que /admin match /admin/tournoi
  return pathname === href || pathname.startsWith(href + "/");
}
function buildSectionState(sections: MenuSection[], pathname: string) {
  return sections.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.title] = section.items.some((item) =>
      isItemActive(pathname, item.href),
    );
    return acc;
  }, {});
}

export default function Sidebar({ mobile = false }: SidebarProps) {
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
  const widthClasses = cn(
    sidebarState === "expanded" && "w-[260px]",
    sidebarState === "collapsed" && "w-[72px]",
    sidebarState === "hidden" && "w-0 overflow-hidden",
  );
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored) setSidebarState(stored as SidebarState);

    // 🔥 IMPORTANT : on ne merge plus
    const baseState = buildSectionState(sections, pathname);

    setOpenSections(baseState);
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

  const reopenSidebar = () => {
    setSidebarState("expanded");
  };

  return (
    <>
      {!mobile && sidebarState === "hidden" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="fixed left-3 top-20 z-50 gap-2 shadow-md"
          aria-label="Rouvrir la sidebar"
          onClick={reopenSidebar}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      <div
        className={cn(
          "transition-all duration-300",
          mobile ? "w-full" : ["relative shrink-0", widthClasses],
        )}
      >
        <aside
          className={cn(
            "flex flex-col border-r ",
            mobile
              ? "h-full"
              : [
                  "fixed left-0 top-0 z-40 h-screen pt-16 transition-all duration-300",
                  widthClasses,
                ],
          )}
        >
          <div className="flex h-14 items-center justify-between border-b px-3">
            {!collapsed && <p className="text-sm font-semibold">Navigation</p>}

            <div className="hidden md:flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Masquer la sidebar"
                onClick={() => setSidebarState("hidden")}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2 py-4">
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
            <div
              className={cn(
                "flex",
                collapsed ? "justify-center" : "justify-between",
              )}
            >
              {!collapsed && (
                <span className="text-xs text-muted-foreground">Thème</span>
              )}
              <ThemeToggle />
            </div>
            <AuthButton collapsed={collapsed} />
          </div>
        </aside>
      </div>
    </>
  );
}
