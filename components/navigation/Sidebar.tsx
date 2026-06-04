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
import { authClient } from "@/lib/auth-client";
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

function isAdminTournamentPath(pathname: string) {
  return pathname === "/admin/tournoi" || pathname.startsWith("/admin/tournoi/");
}

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      (pathname.startsWith("/admin/") && !isAdminTournamentPath(pathname))
    );
  }

  return pathname === href || pathname.startsWith(href + "/");
}

function buildSectionState(sections: MenuSection[], pathname: string) {
  const activeSectionTitle = sections.find((section) =>
    section.items.some((item) => isItemActive(pathname, item.href)),
  )?.title;
  const hasAdminSection = sections.some(
    (section) => section.title === "Administration",
  );

  const preferredSectionTitle =
    activeSectionTitle ??
    (pathname.startsWith("/admin") && hasAdminSection
      ? "Administration"
      : undefined);

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
  const { data: session } = authClient.useSession();
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
  const isAdminTournamentView = isAdminTournamentPath(pathname);
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const accentDotClass = isAdminTournamentView
    ? "bg-[#FF7A00]"
    : isAdminView
      ? "bg-sky-400"
      : "bg-emerald-500";
  const accentGlowClass = isAdminTournamentView
    ? "bg-gradient-to-r from-[#FF7A00]/0 via-[#FF7A00]/70 to-[#FF7A00]/0"
    : isAdminView
      ? "bg-gradient-to-r from-sky-400/0 via-sky-400/70 to-sky-400/0"
      : "bg-gradient-to-r from-emerald-400/0 via-emerald-400/70 to-emerald-400/0";

  const widthClasses = cn(
    sidebarState === "expanded" && "w-[352px]",
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
    ? "Accès rapides au club et au tournoi."
    : "Retrouvez vos actions et documents.";

  async function signOutToHome() {
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <>
      {!mobile && sidebarState === "hidden" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="fixed left-3 top-20 z-50 gap-2 rounded-full border border-border/70 bg-background/90 text-foreground shadow-md backdrop-blur dark:text-white"
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
            "flex flex-col overflow-hidden border-r border-border/60 bg-background/95",
            "supports-[backdrop-filter]:bg-background/88 supports-[backdrop-filter]:backdrop-blur",
            mobile
              ? [
                  "fixed inset-y-0 left-0 z-50 h-dvh w-full max-w-[352px] transition-transform",
                  isMobileOpen ? "translate-x-0" : "-translate-x-full",
                ]
              : [
                  "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
                  widthClasses,
                ],
          )}
        >
          <div
            className={cn(
              "flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%)] px-4 pt-5 dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.09),_transparent_28%)]",
              mobile
                ? "pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
                : "pb-5",
            )}
          >
            <div className="admin-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
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
                <>
                  <Image
                    src="/logo_trans_light_v3.png"
                    alt="Logo CCTT"
                    width={220}
                    height={110}
                    className={cn(
                      "object-contain transition-all duration-300 dark:hidden",
                      collapsed && !mobile ? "h-10 w-10" : "h-16 w-auto",
                    )}
                  />
                  <Image
                    src="/cctt_logo_trans_blanc.png"
                    alt="Logo CCTT"
                    width={220}
                    height={110}
                    className={cn(
                      "hidden object-contain transition-all duration-300 dark:block",
                      collapsed && !mobile ? "h-10 w-10" : "h-16 w-auto",
                    )}
                  />
                </>
              </span>
            </Link>

            <div
              className={cn(
                "relative mb-4 rounded-[1.35rem] border border-white/8 bg-white/[0.04] px-3.5 py-3.5 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.8)] backdrop-blur-sm",
                collapsed && !mobile && "px-2.5 py-3",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-5 top-0 h-px opacity-90",
                  accentGlowClass,
                )}
              />
              <div
                className={cn(
                  "flex min-h-[104px] items-start justify-between gap-3",
                  !collapsed && "pr-1",
                )}
              >
                {!collapsed ? (
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <span className={cn("h-2 w-2 rounded-full", accentDotClass)} />
                      {isAdminView ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
                      <span>{isAdminView ? "Back-office" : "Dashboard"}</span>
                    </div>
                    <p className="text-[17px] font-semibold tracking-tight text-foreground">
                      {heroTitle}
                    </p>
                    <p className="mt-1.5 max-w-[20rem] text-[13px] leading-[1.5] text-muted-foreground/90">
                      {heroDescription}
                    </p>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex shrink-0 items-center gap-2 self-start",
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
                      className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.05] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
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
                      className="h-9 w-9 rounded-full border border-white/8 bg-white/[0.05] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {!collapsed ? (
              <div className="mb-2.5 px-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/72">
                  Navigation
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
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
            </div>

            <div
              className={cn(
                "z-10 mt-3 grid shrink-0 gap-1 rounded-[0.95rem] border border-border/30 bg-background/40 p-1.5 backdrop-blur-sm",
                session && !collapsed && "grid-cols-2",
                collapsed && !mobile && "px-1.5 py-1.5",
              )}
            >
              <Link
                href="/"
                onClick={mobile ? onClose : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-[0.8rem] border border-border/25 bg-background/45 px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-foreground/4 hover:text-foreground",
                  collapsed && !mobile && "justify-center px-0",
                )}
              >
                <PanelLeftOpen className="h-3.5 w-3.5" />
                {!collapsed ? <span>Site</span> : null}
              </Link>

              {session ? (
                <div
                  className={cn(
                    "min-w-0",
                    collapsed && !mobile && "flex justify-center",
                  )}
                >
                  <div
                    className={cn(
                      "grid gap-1",
                      "grid-cols-1",
                    )}
                  >
                  <Link
                    href="/user"
                    onClick={mobile ? onClose : undefined}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-[0.8rem] border border-border/25 bg-background/45 px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-foreground/4 hover:text-foreground",
                      collapsed && !mobile && "justify-center px-1.5",
                    )}
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border/35 bg-foreground/[0.04]">
                        <User2 className="h-3 w-3" />
                      </span>
                    )}
                    {!collapsed ? (
                      <span className="truncate text-[12px] font-medium text-foreground/90">
                        {session.user?.name?.split(" ")[0] ?? "Mon espace"}
                      </span>
                    ) : null}
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "hidden",
                      collapsed && !mobile && "h-7 w-7",
                    )}
                    onClick={() => void signOutToHome()}
                    aria-label="Déconnexion"
                    title="Déconnexion"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {!collapsed ? "Déconnexion" : null}
                  </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
