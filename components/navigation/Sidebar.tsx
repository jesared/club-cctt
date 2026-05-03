"use client";

import { EyeOff, LogOut, PanelLeftOpen, User2, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import {
  getVisibleSections,
  type NavigationBadges,
  type MenuSection,
} from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/roles";
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
  badges?: NavigationBadges;
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
  badges,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();

  const sections = useMemo(
    () =>
      getVisibleSections({
        role: session?.user?.role,
        session: session ?? null,
        badges,
      })
        .filter((section) =>
          section.items.every(
            (item) =>
              !item.href.startsWith("/club") && !item.href.startsWith("/tournoi"),
          ),
        )
        .sort((a, b) => {
        const order: Record<string, number> = {
          "Mon espace": 0,
          Administration: 1,
          "Admin tournoi": 2,
        };

        return (order[a.title] ?? 99) - (order[b.title] ?? 99);
      }),
    [badges, session],
  );

  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");
  const [mounted, setMounted] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const isMobileOpen = mobile ? (open ?? true) : (open ?? false);

  const collapsed = sidebarState === "collapsed";
  const isAdmin = isAdminRole(session?.user?.role);
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const logoSrc = isDark ? "/logo_trans.png" : "/logo_trans_dark.png";

  const widthClasses = cn(
    sidebarState === "expanded" && "w-[280px]",
    sidebarState === "collapsed" && "w-[76px]",
    sidebarState === "hidden" && "w-0 overflow-hidden",
  );

  // init
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored) setSidebarState(stored as SidebarState);

    const baseState = buildSectionState(sections, pathname);
    setOpenSections(baseState);
  }, [pathname, sections]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            "flex flex-col border-r bg-muted/20",
            mobile
              ? [
                  "fixed inset-y-0 left-0 z-50 w-[280px] h-screen overflow-y-auto transition-transform",
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
              "mx-4 mb-3 mt-2 flex justify-center transition-all duration-300",
              collapsed && "justify-center",
            )}
          >
            <Image
              src={logoSrc}
              alt="Logo"
              width={160}
              height={80}
              className={cn(
                "object-contain",
                mobile ? "h-12 w-auto" : collapsed ? "h-8 w-8" : "h-12 w-auto",
              )}
            />
          </Link>

          {/* Header */}
          <div className="mx-3 mb-1 rounded-2xl border bg-background px-3 py-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Dashboard
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Administration et outils internes" : "Espace membre prive"}
                </p>
              </div>
            )}

            <div className="flex items-center gap-1">
              {!collapsed ? <ThemeToggle /> : null}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarState("hidden")}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </div>

          {/* Menu */}
          <div className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-2 overscroll-contain">
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
          <div className="space-y-2 border-t p-3">
            <div className="flex">
              <Link
                href="/"
                onClick={mobile ? onClose : undefined}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 w-full justify-start rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  Retour au site
                </Button>
              </Link>
            </div>

            {session ? (
              <div
                className={cn(
                  "space-y-2",
                  collapsed && "flex flex-col items-center",
                )}
              >
                <Link
                  href="/user"
                  onClick={mobile ? onClose : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <User2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {!collapsed ? (
                    <span className="truncate">{session.user?.name ?? "Mon espace"}</span>
                  ) : null}
                </Link>

                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 w-full justify-start rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                  onClick={() => void signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed ? "Deconnexion" : null}
                </Button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}
