"use client";

import { ChevronLeft, X } from "lucide-react";
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

  /* ================= LOAD ================= */

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

  /* ================= SAVE ================= */

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarState);
  }, [sidebarState]);

  useEffect(() => {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(openSections));
  }, [openSections]);

  /* ================= ACTIONS ================= */

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

  /* ================= RENDER ================= */

  return (
    <div
      className={cn(
        "transition-all duration-300",
        sidebarState === "expanded" && "w-[260px]",
        sidebarState === "collapsed" && "w-[72px]",
        sidebarState === "hidden" && "w-0 overflow-hidden",
      )}
    >
      <aside className="h-full flex flex-col border-r bg-card mt-14">
        {/* HEADER */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          {!collapsed && <p className="text-sm font-semibold">Navigation</p>}

          <div className="flex items-center gap-1">
            {/* COLLAPSE */}
            <Button size="icon" variant="ghost" onClick={toggleCollapse}>
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180",
                )}
              />
            </Button>

            {/* HIDE */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setSidebarState("hidden");
                localStorage.setItem(SIDEBAR_KEY, "hidden");

                // 🔥 IMPORTANT
                window.dispatchEvent(new Event("sidebar:update"));
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
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

        {/* FOOTER */}
        <div className="border-t p-3 space-y-3">
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
  );
}
