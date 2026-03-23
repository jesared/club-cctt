"use client";

import { EyeOff, PanelLeftOpen, X } from "lucide-react";
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

import Image from "next/image";
import Link from "next/link";
import SidebarSection from "./SidebarSection";

const SIDEBAR_KEY = "app.sidebar.state";
const SECTIONS_KEY = "app.sidebar.sections";

type SidebarState = "expanded" | "collapsed" | "hidden";

type SidebarProps = {
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }

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

export default function Sidebar({
  mobile = false,
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sections = useMemo(
    () =>
      getVisibleSections({
        role: session?.user?.role,
        session: session ?? null,
      }).filter((section) => {
        const isPublicSection = section.items.every(
          (item) =>
            item.href.startsWith("/club") || item.href.startsWith("/tournoi"),
        );
        return !isPublicSection;
      }),
    [session],
  );

  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const isMobileOpen = mobile ? (open ?? true) : (open ?? false);

  const collapsed = sidebarState === "collapsed";

  const widthClasses = cn(
    sidebarState === "expanded" && "w-[260px]",
    sidebarState === "collapsed" && "w-[72px]",
    sidebarState === "hidden" && "w-0 overflow-hidden",
  );

  // init
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored) setSidebarState(stored as SidebarState);

    const baseState = buildSectionState(sections, pathname);
    setOpenSections(baseState);
  }, [pathname, sections]);

  // persist sidebar
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarState);
    window.dispatchEvent(new Event("sidebar:update"));
  }, [sidebarState]);

  // persist sections
  useEffect(() => {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // bloque scroll body en mobile
  useEffect(() => {
    if (mobile && isMobileOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen, mobile]);

  const reopenSidebar = () => {
    setSidebarState("expanded");
  };

  return (
    <>
      {/* Bouton reopen desktop */}
      {!mobile && sidebarState === "hidden" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="fixed left-3 top-20 z-50 gap-2 shadow-md"
          onClick={reopenSidebar}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Overlay mobile */}
      {mobile && isMobileOpen && onClose && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      <div
        className={cn(
          "transition-all duration-300",
          mobile ? "w-full" : ["relative shrink-0", widthClasses],
        )}
      >
        <aside
          className={cn(
            "flex flex-col border-r bg-background",
            mobile
              ? [
                  "fixed inset-y-0 left-0 z-50 w-[260px] h-screen overflow-y-auto transition-transform",
                  isMobileOpen ? "translate-x-0" : "-translate-x-full",
                ]
              : [
                  "fixed left-0 top-0 z-40 h-screen pt-4 transition-all duration-300",
                  widthClasses,
                ],
          )}
        >
          {/* Bouton fermer mobile */}
          {mobile && onClose && (
            <div className="flex justify-end p-3">
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Logo */}
          <Link
            href="/"
            onClick={mobile ? onClose : undefined}
            className={cn(
              "flex justify-center mx-16 m-4 transition-all duration-300",
              collapsed && "justify-center",
            )}
          >
            {mobile ? (
              <span className="text-2xl font-bold tracking-wide">CCTT</span>
            ) : (
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={160}
                height={160}
                className={cn(
                  "object-contain rounded-lg",
                  collapsed ? "h-8 w-8" : "h-auto w-auto",
                )}
              />
            )}
          </Link>

          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b px-3">
            {!collapsed && (
              <>
                <ThemeToggle />
              </>
            )}

            <div className="hidden md:flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarState("hidden")}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Menu */}
          <div className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2 py-4 overscroll-contain">
            {sections.map((section) => (
              <SidebarSection
                key={section.title}
                section={section}
                collapsed={collapsed}
                open={!!openSections[section.title]}
                onToggle={() => toggleSection(section.title)}
                onNavigate={mobile ? onClose : undefined}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="space-y-1 border-t p-3">
            <div
              className={cn(
                "flex",
                collapsed ? "justify-center" : "justify-between",
              )}
            ></div>
            <AuthButton collapsed={collapsed} />
          </div>
        </aside>
      </div>
    </>
  );
}
