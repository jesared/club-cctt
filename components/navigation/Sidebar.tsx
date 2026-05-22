"use client";

import {
  EyeOff,
  LogOut,
  Moon,
  PanelLeftOpen,
  ShieldCheck,
  Sun,
  User2,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import {
  getVisibleSections,
  type MenuSection,
  type NavigationBadges,
} from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

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
  const preferredSectionTitle =
    pathname.startsWith("/admin") &&
    sections.some((section) => section.title === "Administration")
      ? "Administration"
      : sections.find((section) =>
          section.items.some((item) => isItemActive(pathname, item.href)),
        )?.title;

  return sections.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.title] = section.title === preferredSectionTitle;
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
  const { resolvedTheme, setTheme } = useTheme();

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

  const collapsed = !mobile && sidebarState === "collapsed";
  const isAdmin = isAdminRole(session?.user?.role);
  const isAdminView = pathname.startsWith("/admin");
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const logoSrc = isDark
    ? "/cctt_logo_trans_blanc.png"
    : "/logo_trans_light.png";

  const widthClasses = cn(
    sidebarState === "expanded" && "w-[320px]",
    sidebarState === "collapsed" && "w-[92px]",
    sidebarState === "hidden" && "w-0 overflow-hidden",
  );

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored) setSidebarState(stored as SidebarState);

    const baseState = buildSectionState(sections, pathname);
    setOpenSections(baseState);
  }, [pathname, sections]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, sidebarState);
    window.dispatchEvent(new Event("sidebar:update"));
  }, [sidebarState]);

  useEffect(() => {
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(openSections));
  }, [openSections]);

  useEffect(() => {
    if (mobile && isMobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen, mobile]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const nextIsOpen = !prev[title];

      return sections.reduce<Record<string, boolean>>((acc, section) => {
        acc[section.title] = section.title === title ? nextIsOpen : false;
        return acc;
      }, {});
    });
  };

  const heroTitle = isAdminView ? "Administration" : "Mon espace";
  const heroDescription = isAdmin
    ? "Acces rapides au club et au tournoi."
    : "Retrouvez vos actions et documents.";

  return (
    <>
      {!mobile && sidebarState === "hidden" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="fixed left-3 top-20 z-50 gap-2 rounded-full border border-border/70 bg-background/90 shadow-md backdrop-blur"
          onClick={() => setSidebarState("expanded")}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      ) : null}

      {mobile && isMobileOpen && onClose ? (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      ) : null}

      <div
        className={cn(
          "transition-all duration-300",
          mobile ? "w-full" : ["relative shrink-0", widthClasses],
        )}
      >
        <aside
          className={cn(
            "flex flex-col overflow-y-auto border-r border-border/70 bg-background/95",
            "supports-[backdrop-filter]:bg-background/90 supports-[backdrop-filter]:backdrop-blur",
            mobile
              ? [
                  "fixed inset-y-0 left-0 z-50 h-screen w-full max-w-[320px] transition-transform",
                  isMobileOpen ? "translate-x-0" : "-translate-x-full",
                ]
              : [
                  "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
                  widthClasses,
                ],
          )}
        >
          <div className="flex min-h-full flex-col px-4 pb-4 pt-4">
            {mobile && onClose ? (
              <div className="mb-2 flex justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : null}

            <Link
              href="/"
              onClick={mobile ? onClose : undefined}
              className={cn(
                "mb-4 flex justify-center transition-all duration-300",
                collapsed && "mb-3",
              )}
            >
              <span className="inline-flex items-center justify-center px-4 py-3">
                <Image
                  src={logoSrc}
                  alt="Logo CCTT"
                  width={220}
                  height={110}
                  className={cn(
                    "object-contain transition-all duration-300",
                    collapsed && !mobile ? "h-10 w-10" : "h-16 w-auto",
                  )}
                />
              </span>
            </Link>

            <div
              className={cn(
                "mb-4 rounded-[1.5rem] border border-border/70 bg-background px-4 py-4 shadow-sm",
                isAdminView
                  ? "border-l-4 border-l-foreground"
                  : "border-l-4 border-l-emerald-600",
                collapsed && !mobile && "px-2.5 py-3",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                {!collapsed ? (
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {isAdminView ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
                      <span>{isAdminView ? "Back-office" : "Dashboard"}</span>
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {heroTitle}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {heroDescription}
                    </p>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex shrink-0 items-center gap-1",
                    collapsed && !mobile && "mx-auto flex-col",
                  )}
                >
                  {!collapsed ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
                      title={isDark ? "Mode clair" : "Mode sombre"}
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="h-10 w-10 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {isDark ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  ) : null}

                  {!mobile ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setSidebarState("hidden")}
                      className="h-10 w-10 rounded-full border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-3">
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

            <div
              className={cn(
                "mt-4 space-y-2 rounded-[1.5rem] border border-border/70 bg-background p-3 shadow-sm",
                collapsed && !mobile && "px-2 py-3",
              )}
            >
              <Link
                href="/"
                onClick={mobile ? onClose : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    collapsed && !mobile && "justify-center px-0",
                  )}
                >
                {!collapsed ? <span>Retour au site</span> : <PanelLeftOpen className="h-4 w-4" />}
              </Link>

              {session ? (
                <div
                  className={cn(
                    "space-y-2",
                    collapsed && !mobile && "flex flex-col items-center",
                  )}
                >
                  <Link
                    href="/user"
                    onClick={mobile ? onClose : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      collapsed && !mobile && "justify-center px-0",
                    )}
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User2 className="h-4 w-4" />
                      </span>
                    )}
                    {!collapsed ? (
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {session.user?.name ?? "Mon espace"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Ouvrir le profil
                        </span>
                      </span>
                    ) : null}
                  </Link>

                  <Button
                    variant="ghost"
                    className={cn(
                      "h-auto w-full justify-start rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && !mobile && "justify-center px-0",
                    )}
                    onClick={() => void signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    {!collapsed ? "Déconnexion" : null}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
