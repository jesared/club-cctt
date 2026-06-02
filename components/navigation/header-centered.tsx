"use client";

import {
  ArrowRight,
  Bell,
  Building2,
  ChevronDown,
  Compass,
  LogIn,
  LogOut,
  Menu,
  Moon,
  ShieldMinus,
  Sparkles,
  Sun,
  Trophy,
  User2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getVisibleSections } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PublicMenuVisibility } from "@/lib/menu-settings";
import { isPublicMenuVisible } from "@/lib/menu-settings";
import { isAdminRole } from "@/lib/roles";
import { isPublicRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/club" || href === "/tournoi") {
    return pathname === href;
  }

  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/tournoi"))
    );
  }

  if (href === "/admin/tournoi") {
    return pathname.startsWith("/admin/tournoi");
  }

  return pathname === href || pathname.startsWith(href + "/");
}

type HeaderProps = {
  menuVisibility?: PublicMenuVisibility;
  showTournamentRegistration?: boolean;
};

type HeaderInboxItem = {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
  authorName: string | null;
  authorEmail: string | null;
  isUnread: boolean;
  href: string;
};

export default function HeaderCentered({
  menuVisibility,
  showTournamentRegistration = false,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [inboxItems, setInboxItems] = useState<HeaderInboxItem[]>([]);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [pendingReadIds, setPendingReadIds] = useState<string[]>([]);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Club");
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const sectionMeta = useMemo(
    () =>
      ({
        Club: {
          eyebrow: "Vie du club",
          icon: Building2,
          description: "Decouvrir le club, ses horaires et ses infos utiles.",
          cta: { href: "/club/contact", label: "Contacter le club" },
          items: {
            "/club/horaires": "Creneaux, salles et periodes d'ouverture.",
            "/club/tarifs": "Tarifs et formules d'adhesion.",
            "/club/partenaires": "Soutiens et partenaires du club.",
            "/club/comite-directeur": "Équipe dirigeante du club.",
            "/club/contact": "Contact et localisation.",
          } as Record<string, string>,
        },
        Tournoi: {
          eyebrow: "Tournoi",
          icon: Trophy,
          description: "Suivre le tournoi, l'inscription et les resultats.",
          cta: { href: "/tournoi/inscription", label: "S'inscrire au tournoi" },
          items: {
            "/tournoi": "Presentation et dates cles.",
            "/tournoi/inscription": "Formulaire d'inscription en ligne.",
            "/tournoi/liste-inscrits": "Liste des participants.",
            "/tournoi/resultats": "Resultats et classements.",
            "/tournoi/palmares": "Palmares des editions precedentes.",
            "/tournoi/affiches": "Affiches et supports officiels.",
          } as Record<string, string>,
        },
      }) satisfies Record<
        "Club" | "Tournoi",
        {
          eyebrow: string;
          icon: typeof Building2;
          description: string;
          cta: { href: string; label: string };
          items: Record<string, string>;
        }
      >,
    [],
  );

  const publicSections = useMemo(
    () =>
      getVisibleSections({
        role: session?.user?.role,
        session: session ?? null,
        menuVisibility,
      })
        .filter((section) =>
          section.items.every(
            (item) =>
              item.href.startsWith("/club") || item.href.startsWith("/tournoi"),
          ),
        )
        .sort((a, b) => {
          const order: Record<string, number> = { Club: 0, Tournoi: 1 };
          return (order[a.title] ?? 99) - (order[b.title] ?? 99);
        })
        .map((section) =>
          section.title === "Tournoi" && !showTournamentRegistration
            ? {
                ...section,
                items: section.items.filter(
                  (item) => item.href !== "/tournoi/inscription",
                ),
              }
            : section,
        ),
    [menuVisibility, session, showTournamentRegistration],
  );

  const isAdmin = isAdminRole(session?.user?.role);
  const messagesHubHref = "/user/notifications";
  const tournoiVisible = isPublicMenuVisible(menuVisibility, "tournoi");
  const isDark = mounted ? resolvedTheme === "dark" : false;

  const desktopSections = useMemo(
    () =>
      publicSections.filter(
        (section) => section.title === "Club" || section.title === "Tournoi",
      ),
    [publicSections],
  );

  const desktopLabels = {
    Club: "Le club",
    Tournoi: "Tournoi de Pâques",
  } satisfies Record<"Club" | "Tournoi", string>;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncScrolled = () => {
      setScrolled(window.scrollY > 16);
    };

    syncScrolled();
    window.addEventListener("scroll", syncScrolled, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncScrolled);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/club")) {
      setOpenSection("Club");
      return;
    }

    if (pathname.startsWith("/tournoi")) {
      setOpenSection("Tournoi");
    }
  }, [pathname]);

  useEffect(() => {
    if (!isPublicRoute(pathname)) return;
    if (isPublicMenuVisible(menuVisibility, "tournoi")) {
      router.prefetch("/tournoi");
      router.prefetch("/tournoi/liste-inscrits");
      if (showTournamentRegistration) {
        router.prefetch("/tournoi/inscription");
      }
    }
    if (isAdmin) {
      router.prefetch("/admin/tournoi");
      router.prefetch("/admin/tournoi/paiement");
      router.prefetch("/admin/tournoi/pointages");
    }
  }, [isAdmin, menuVisibility, pathname, router, showTournamentRegistration]);

  useEffect(() => {
    if (!session?.user) {
      setUnreadNotificationCount(0);
      setInboxItems([]);
      setPendingReadIds([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      await fetchInbox({ previewOnly: true });
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, session?.user]);

  useEffect(() => {
    if (!session?.user || !notificationsOpen) {
      return;
    }

    let cancelled = false;

    void (async () => {
      await fetchInbox({ onEmptyError: true });
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
    };
  }, [notificationsOpen, session?.user]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current) return;
      if (accountMenuRef.current.contains(event.target as Node)) return;
      setAccountMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!notificationsRef.current) return;
      if (notificationsRef.current.contains(event.target as Node)) return;
      setNotificationsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  async function signOutToHome() {
    await authClient.signOut();
    window.location.href = "/";
  }

  async function fetchInbox({
    previewOnly = false,
    onEmptyError = false,
  }: {
    previewOnly?: boolean;
    onEmptyError?: boolean;
  }) {
    if (!previewOnly) {
      setIsInboxLoading(true);
    }

    try {
      const response = await fetch("/api/notifications/inbox", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to load inbox.");
      }

      const data = (await response.json()) as {
        unreadCount?: number;
        items?: HeaderInboxItem[];
      };

      setUnreadNotificationCount(
        typeof data.unreadCount === "number" ? data.unreadCount : 0,
      );
      setInboxItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      if (onEmptyError) {
        setInboxItems([]);
      }
    } finally {
      if (!previewOnly) {
        setIsInboxLoading(false);
      }
    }
  }

  async function markMessageAsRead(messageId: string) {
    if (pendingReadIds.includes(messageId)) {
      return false;
    }

    const targetMessage = inboxItems.find((item) => item.id === messageId);
    if (!targetMessage?.isUnread) {
      return true;
    }

    setPendingReadIds((current) => [...current, messageId]);
    setInboxItems((current) =>
      current.map((item) =>
        item.id === messageId ? { ...item, isUnread: false } : item,
      ),
    );
    setUnreadNotificationCount((current) => Math.max(current - 1, 0));

    try {
      const response = await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId: messageId }),
      });

      if (!response.ok) {
        throw new Error("Unable to mark message as read.");
      }

      return true;
    } catch {
      setInboxItems((current) =>
        current.map((item) =>
          item.id === messageId ? { ...item, isUnread: true } : item,
        ),
      );
      setUnreadNotificationCount((current) => current + 1);
      return false;
    } finally {
      setPendingReadIds((current) => current.filter((id) => id !== messageId));
    }
  }

  async function openInboxItem(item: HeaderInboxItem) {
    await markMessageAsRead(item.id);
    setNotificationsOpen(false);
    router.push(item.href);
  }

  async function markAllMessagesAsRead() {
    const unreadIds = inboxItems
      .filter((item) => item.isUnread)
      .map((item) => item.id);

    if (unreadIds.length === 0 || isMarkingAllRead) {
      return;
    }

    setIsMarkingAllRead(true);
    setPendingReadIds((current) => [...new Set([...current, ...unreadIds])]);
    setInboxItems((current) =>
      current.map((item) => ({ ...item, isUnread: false })),
    );
    setUnreadNotificationCount(0);

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to mark all messages as read.");
      }
    } catch {
      setInboxItems((current) =>
        current.map((item) =>
          unreadIds.includes(item.id) ? { ...item, isUnread: true } : item,
        ),
      );
      setUnreadNotificationCount(unreadIds.length);
    } finally {
      setPendingReadIds((current) =>
        current.filter((id) => !unreadIds.includes(id)),
      );
      setIsMarkingAllRead(false);
    }
  }

  if (!isPublicRoute(pathname)) {
    return null;
  }

  const hasUnreadMessages = unreadNotificationCount > 0;
  const unreadMessageLabel =
    unreadNotificationCount > 9 ? "9+" : String(unreadNotificationCount);
  const headerActionSurface =
    "border border-border/70 bg-background/90 shadow-sm transition-all duration-200 dark:border-white/10 dark:bg-white/5";
  const inboxSummaryLabel =
    unreadNotificationCount > 0
      ? `${unreadNotificationCount} nouvelle${
          unreadNotificationCount > 1 ? "s" : ""
        } notification${unreadNotificationCount > 1 ? "s" : ""}`
      : "A jour";

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent bg-background/85 backdrop-blur transition-all duration-200 supports-[backdrop-filter]:bg-background/70",
          scrolled && "border-border/60 bg-background/92 shadow-sm",
        )}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div
            className={cn(
              "relative flex items-center justify-between transition-all duration-200",
              scrolled ? "min-h-[5rem] pt-2 pb-1.5" : "min-h-[5.65rem] pt-3 pb-2.5",
            )}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-muted/20 text-slate-600 transition-colors hover:bg-muted/55 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
                  menuOpen && "bg-muted/75 text-foreground dark:bg-white/12",
                )}
                aria-expanded={menuOpen}
                aria-controls="header-centered-menu"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {menuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                aria-label={
                  isDark ? "Passer au mode clair" : "Passer au mode sombre"
                }
                title={isDark ? "Mode clair" : "Mode sombre"}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-muted/20 transition-colors dark:bg-white/5",
                  isDark
                    ? "text-amber-300/90 hover:bg-white/10 hover:text-amber-200"
                    : "text-slate-600 hover:bg-muted/55 hover:text-slate-900",
                )}
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:flex md:justify-center">
              <div className="pointer-events-auto flex items-center gap-2.5 text-sm">
                {desktopSections
                  .filter((section) => section.title === "Club")
                  .map((section) => {
                    const active = pathname.startsWith("/club");

                    return (
                      <Link
                        key={section.title}
                        href="/club"
                        className={cn(
                          "rounded-full px-3.5 py-1.5 font-medium tracking-[0.01em] transition-colors",
                          active
                            ? "bg-slate-100/85 text-slate-900 dark:bg-slate-400/10 dark:text-white"
                            : "text-muted-foreground hover:bg-muted/45 hover:text-foreground",
                        )}
                      >
                        {desktopLabels.Club}
                      </Link>
                    );
                  })}

                <div
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    scrolled ? "w-40 lg:w-48" : "w-48 lg:w-56",
                  )}
                />

                {desktopSections
                  .filter((section) => section.title === "Tournoi")
                  .map((section) => {
                    const active = pathname.startsWith("/tournoi");

                    return (
                      <Link
                        key={section.title}
                        href="/tournoi"
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[0.925rem] font-medium tracking-normal whitespace-nowrap transition-colors",
                          active
                            ? "bg-stone-100/90 text-stone-900 dark:bg-stone-400/10 dark:text-white"
                            : "text-muted-foreground hover:bg-muted/45 hover:text-foreground",
                        )}
                      >
                        {desktopLabels.Tournoi}
                      </Link>
                    );
                  })}
              </div>
            </div>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 px-3 py-1 text-center shadow-sm ring-1 ring-border/50 md:hidden"
            >
              <span className="inline-flex items-center justify-center drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                <>
                  <Image
                    src="/logo_trans_light_v3.png"
                    alt="Logo CCTT"
                    width={240}
                    height={120}
                    unoptimized
                    priority
                    sizes="176px"
                    className={cn(
                      "h-auto w-auto max-w-[10.5rem] object-contain transition-all duration-200 dark:hidden",
                      scrolled
                        ? "max-h-[2.55rem]"
                        : "max-h-[2.9rem]",
                    )}
                  />
                  <Image
                    src="/cctt_logo_trans_blanc.png"
                    alt="Logo CCTT"
                    width={240}
                    height={120}
                    unoptimized
                    priority
                    sizes="176px"
                    className={cn(
                      "hidden h-auto w-auto max-w-[10.5rem] object-contain transition-all duration-200 dark:block",
                      scrolled
                        ? "max-h-[2.55rem]"
                        : "max-h-[2.9rem]",
                    )}
                  />
                </>
              </span>
            </Link>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 hidden max-w-[calc(100%-11rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center md:flex"
            >
              <span className="inline-flex items-center justify-center px-2 py-1 drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                <>
                  <Image
                    src="/logo_trans_light_v3.png"
                    alt="Logo CCTT"
                    width={240}
                    height={120}
                    unoptimized
                    className={cn(
                      "w-auto max-w-full object-contain transition-all duration-200 dark:hidden",
                      scrolled ? "h-[3.95rem]" : "h-[4.65rem]",
                    )}
                  />
                  <Image
                    src="/cctt_logo_trans_blanc.png"
                    alt="Logo CCTT"
                    width={240}
                    height={120}
                    unoptimized
                    className={cn(
                      "hidden w-auto max-w-full object-contain transition-all duration-200 dark:block",
                      scrolled ? "h-[3.95rem]" : "h-[4.65rem]",
                    )}
                  />
                </>
              </span>
            </Link>

            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
              {tournoiVisible && showTournamentRegistration ? (
                <Link
                  href="/tournoi/inscription"
                  className={cn(
                    "hidden h-10 items-center rounded-full px-3.5 text-[0.92rem] font-medium tracking-[0.01em] text-foreground/90 hover:border-border hover:bg-background hover:text-foreground dark:text-white/90 dark:hover:border-white/15 dark:hover:bg-white/8 dark:hover:text-white md:inline-flex",
                    headerActionSurface,
                  )}
                >
                  S&apos;inscrire
                </Link>
              ) : null}

              {session ? (
                <>
                  <div ref={notificationsRef} className="relative">
                    <button
                      type="button"
                      aria-label={
                        hasUnreadMessages
                          ? `${unreadNotificationCount} notification${
                              unreadNotificationCount > 1 ? "s" : ""
                            } non lue${unreadNotificationCount > 1 ? "s" : ""}`
                          : "Ouvrir les notifications"
                      }
                      aria-haspopup="dialog"
                      aria-expanded={notificationsOpen}
                      className={cn(
                        "group relative inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-slate-200 dark:hover:text-white",
                        headerActionSurface,
                        hasUnreadMessages &&
                          "border-rose-300/70 text-rose-700 dark:border-rose-400/35 dark:text-rose-200",
                        notificationsOpen &&
                          "border-rose-300/80 bg-background text-slate-950 shadow-md dark:border-rose-400/40 dark:bg-white/8 dark:text-white",
                      )}
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setNotificationsOpen((prev) => !prev);
                      }}
                    >
                      <Bell className="h-[1.05rem] w-[1.05rem] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110" />
                      {hasUnreadMessages ? (
                        <>
                          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-semibold leading-none text-white shadow-sm ring-2 ring-background dark:ring-slate-900">
                            {unreadMessageLabel}
                          </span>
                        </>
                      ) : null}
                    </button>

                    {notificationsOpen ? (
                      <>
                        <button
                          type="button"
                          aria-label="Fermer les notifications"
                          className="fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-[1px] sm:hidden"
                          onClick={() => setNotificationsOpen(false)}
                        />
                        <div
                          role="dialog"
                          aria-label="Notifications"
                          className="fixed inset-x-3 top-[5.25rem] z-50 overflow-hidden rounded-[1.35rem] border border-border/70 bg-background/95 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur dark:bg-slate-950/92 sm:absolute sm:right-0 sm:top-[calc(100%+0.8rem)] sm:left-auto sm:w-[25rem] sm:rounded-[1.6rem]"
                        >
                          <div className="border-b border-border/70 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_58%)] px-4 py-4 dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_52%)]">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">
                                  Notifications
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {inboxSummaryLabel}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {hasUnreadMessages ? (
                                  <button
                                    type="button"
                                    className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={isMarkingAllRead}
                                    onClick={() => void markAllMessagesAsRead()}
                                  >
                                    {isMarkingAllRead
                                      ? "Lecture..."
                                      : "Tout marquer comme lu"}
                                  </button>
                                ) : null}
                                <Link
                                  href={messagesHubHref}
                                  className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                  onClick={() => setNotificationsOpen(false)}
                                >
                                  Voir tout
                                </Link>
                              </div>
                            </div>
                          </div>

                          <div className="max-h-[min(24rem,calc(100vh-7rem))] overflow-y-auto px-3 py-3 sm:max-h-[24rem]">
                            {isInboxLoading ? (
                              <div className="grid gap-2">
                                {Array.from({ length: 3 }).map((_, index) => (
                                  <div
                                    key={index}
                                    className="rounded-2xl border border-border/60 bg-muted/25 px-3 py-3"
                                  >
                                    <div className="h-3.5 w-24 rounded-full bg-muted" />
                                    <div className="mt-3 h-4 w-3/4 rounded-full bg-muted" />
                                    <div className="mt-2 h-3.5 w-full rounded-full bg-muted" />
                                  </div>
                                ))}
                              </div>
                            ) : inboxItems.length === 0 ? (
                              <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/15 px-4 py-6 text-center">
                                <p className="text-sm font-medium text-foreground">
                                  Rien de nouveau pour le moment
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  Les prochaines annonces du club apparaitront ici.
                                </p>
                              </div>
                            ) : (
                              <div className="grid gap-2">
                                {inboxItems.map((item) => {
                                  const preview =
                                    item.content.length > 120
                                      ? `${item.content.slice(0, 120).trimEnd()}...`
                                      : item.content;
                                  const formattedDate = new Intl.DateTimeFormat(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                    },
                                  ).format(new Date(item.createdAt));

                                  return (
                                    <div
                                      key={item.id}
                                      className={cn(
                                        "rounded-[1.35rem] border px-3 py-3 transition-all duration-200",
                                        item.isUnread
                                          ? "border-rose-200/80 bg-rose-50/70 dark:border-rose-400/20 dark:bg-rose-400/8"
                                          : "border-border/70 bg-background/70",
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          {item.isUnread ? (
                                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.14)]" />
                                          ) : (
                                            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                                          )}
                                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                            {formattedDate}
                                          </p>
                                        </div>
                                        {item.important ? (
                                          <span className="rounded-full bg-foreground px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-background dark:bg-white dark:text-slate-950">
                                            Important
                                          </span>
                                        ) : null}
                                      </div>

                                      <div className="mt-2 space-y-1">
                                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                                          {item.title}
                                        </p>
                                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                                          {preview}
                                        </p>
                                      </div>

                                      <div className="mt-3 flex items-center justify-between gap-2">
                                        <p className="truncate text-[0.72rem] text-muted-foreground">
                                          {item.authorName ||
                                            item.authorEmail ||
                                            "Club"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          {item.isUnread ? (
                                            <button
                                              type="button"
                                              className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[0.68rem] font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                                              disabled={pendingReadIds.includes(
                                                item.id,
                                              )}
                                              onClick={async () => {
                                                await markMessageAsRead(item.id);
                                              }}
                                            >
                                              {pendingReadIds.includes(item.id)
                                                ? "Lecture..."
                                                : "Marquer comme lu"}
                                            </button>
                                          ) : null}
                                          <button
                                            type="button"
                                            className="rounded-full bg-foreground px-2.5 py-1 text-[0.68rem] font-medium text-background transition-opacity hover:opacity-90 dark:bg-white dark:text-slate-950"
                                            onClick={() => void openInboxItem(item)}
                                          >
                                            Ouvrir
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div ref={accountMenuRef} className="relative">
                    <button
                      type="button"
                      aria-label="Ouvrir le menu du compte"
                      aria-haspopup="menu"
                      aria-expanded={accountMenuOpen}
                      className={cn(
                        "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-sm text-muted-foreground hover:text-foreground",
                        headerActionSurface,
                        accountMenuOpen &&
                          "border-border bg-background text-foreground shadow-md dark:border-white/15 dark:bg-white/8",
                      )}
                      onClick={() => setAccountMenuOpen((prev) => !prev)}
                    >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-border/60"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-1 ring-border/60">
                        <User2 className="h-4 w-4" />
                      </span>
                    )}
                  </button>

                  {accountMenuOpen ? (
                    <div
                      role="menu"
                      aria-label="Menu du compte"
                      className="absolute right-0 top-[calc(100%+0.65rem)] z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-xl backdrop-blur"
                    >
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          role="menuitem"
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <ShieldMinus className="h-4 w-4" />
                          <span>Administration</span>
                        </Link>
                      ) : null}
                      <Link
                        href="/user"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <User2 className="h-4 w-4" />
                        <span>Mon espace</span>
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                        onClick={() => void signOutToHome()}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  ) : null}
                  </div>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 rounded-full border border-transparent px-2.5 text-sm text-slate-600 transition-colors hover:bg-muted/35 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white"
                  asChild
                >
                  <Link href="/auth/signin?callbackUrl=/user">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Connexion</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SheetContent
        id="header-centered-menu"
        side="left"
        className="public-menu-scrollbar w-full max-w-[352px] overflow-y-auto border-r bg-background px-0 sm:max-w-[376px]"
      >
        <div className="flex min-h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_32%)] px-4 pb-5 pt-14 dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.1),_transparent_30%)] sm:px-4">
          <SheetHeader className="mb-4 space-y-4 border-b border-border/70 pb-4">
            <div className="space-y-1 text-left">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-200">
                <Compass className="h-3.5 w-3.5" />
                Navigation rapide
              </div>
              <SheetTitle className="text-xl leading-none tracking-tight">
                Navigation
              </SheetTitle>
              <p className="text-sm leading-5 text-muted-foreground">
                Retrouvez rapidement les pages utiles du club et du tournoi.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-2 shadow-sm backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
                {publicSections.map((section) => {
                  const meta =
                    section.title === "Club" || section.title === "Tournoi"
                      ? sectionMeta[section.title]
                      : null;
                  const active = openSection === section.title;
                  const Icon = meta?.icon ?? Compass;

                  return (
                    <button
                      key={section.title}
                      type="button"
                      onClick={() =>
                        setOpenSection((prev) =>
                          prev === section.title ? null : section.title,
                        )
                      }
                      className={cn(
                        "rounded-[1rem] border px-3 py-3 text-left transition-all",
                        active
                          ? "border-sky-500/25 bg-sky-500/10 shadow-sm dark:border-sky-300/20 dark:bg-sky-300/10"
                          : "border-border/70 bg-background hover:bg-muted/40",
                      )}
                      aria-pressed={active}
                    >
                      <span className="mb-2 flex items-center justify-between">
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full",
                            active
                              ? "bg-sky-600 text-white dark:bg-sky-200 dark:text-slate-950"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {section.items.length}
                        </span>
                      </span>
                      <span className="block text-sm font-semibold text-foreground">
                        {section.title}
                      </span>
                      {meta ? (
                        <span className="mt-1 block text-xs leading-4 text-muted-foreground">
                          {meta.eyebrow}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-1 flex-col">
            <section className="space-y-2 pb-24">
              {publicSections.map((section) => {
                const meta =
                  section.title === "Club" || section.title === "Tournoi"
                    ? sectionMeta[section.title]
                    : null;
                const expanded = openSection === section.title;
                const Icon = meta?.icon ?? Compass;
                const palette =
                  section.title === "Club"
                    ? {
                        section: expanded
                          ? "border-slate-300 bg-slate-100/80 dark:border-slate-400/25 dark:bg-slate-500/8"
                          : "border-slate-200 bg-slate-50/80 dark:border-slate-400/15 dark:bg-slate-500/4",
                        icon: "bg-slate-200 text-slate-600 dark:bg-slate-400/12 dark:text-slate-300",
                        activeIcon: "bg-slate-600 text-white dark:bg-slate-300 dark:text-slate-950",
                        activeRow:
                          "bg-slate-200/80 text-foreground before:bg-slate-500 dark:bg-slate-400/10 dark:before:bg-slate-300",
                        hoverRow:
                          "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-muted-foreground dark:hover:bg-slate-400/6 dark:hover:text-foreground",
                        cta: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-400/8",
                      }
                    : {
                        section: expanded
                          ? "border-stone-300 bg-stone-100/80 dark:border-stone-400/25 dark:bg-stone-500/8"
                          : "border-stone-200 bg-stone-50/80 dark:border-stone-400/15 dark:bg-stone-500/4",
                        icon: "bg-stone-200 text-stone-600 dark:bg-stone-400/12 dark:text-stone-300",
                        activeIcon: "bg-amber-400 text-stone-950 dark:bg-amber-200 dark:text-stone-950",
                        activeRow:
                          "bg-stone-200/80 text-foreground before:bg-amber-500 dark:bg-stone-400/10 dark:before:bg-amber-200",
                        hoverRow:
                          "text-stone-700 hover:bg-stone-100 hover:text-stone-950 dark:text-muted-foreground dark:hover:bg-stone-400/6 dark:hover:text-foreground",
                        cta: "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-400/8",
                      };

                return (
                  <section
                    key={section.title}
                    className={cn(
                      "overflow-hidden rounded-[1.45rem] border px-1.5 py-1.5 transition-all duration-200",
                      palette.section,
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-[1.05rem] px-2.5 py-2.5 text-left transition-colors hover:bg-background/55"
                      onClick={() =>
                        setOpenSection((prev) =>
                          prev === section.title ? null : section.title,
                        )
                      }
                      aria-expanded={expanded}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            expanded ? palette.activeIcon : palette.icon,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          {meta ? (
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                              {meta.eyebrow}
                            </p>
                          ) : null}
                          <p className="mt-0.5 text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                            {section.title}
                          </p>
                          {meta ? (
                            <p className="mt-1 max-w-[17rem] text-[11px] leading-[1.45] text-muted-foreground/90">
                              {meta.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-background/75 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
                          {section.items.length}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition-transform",
                            expanded ? "rotate-180" : "rotate-0",
                          )}
                        />
                      </div>
                    </button>

                    {expanded ? (
                      <div className="space-y-1.5 px-0.5 pb-0.5 pt-1">
                        {section.items.map((submenuItem) => {
                          const active = isItemActive(
                            pathname,
                            submenuItem.href,
                          );
                          const helper = meta?.items?.[submenuItem.href];

                          return (
                            <Link
                              key={submenuItem.href}
                              href={submenuItem.href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "group relative flex items-start gap-2.5 rounded-[1rem] px-2.5 py-2.5 text-[13px] transition-colors before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-full before:opacity-0",
                                active
                                  ? "before:opacity-100 shadow-sm"
                                  : "text-muted-foreground",
                                active ? palette.activeRow : palette.hoverRow,
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                  active
                                    ? palette.activeIcon
                                    : palette.icon,
                                )}
                              >
                                <submenuItem.icon className="h-3 w-3" />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-medium leading-4 text-foreground">
                                  {submenuItem.label}
                                </span>
                                {helper ? (
                                  <span className="mt-1 block text-[11px] leading-[1.45] text-muted-foreground/90">
                                    {helper}
                                  </span>
                                ) : null}
                              </span>
                              <ArrowRight
                                className={cn(
                                  "ml-auto mt-0.5 h-3 w-3 shrink-0 text-muted-foreground transition-all",
                                  active
                                    ? "translate-x-0 opacity-100"
                                    : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100",
                                )}
                              />
                            </Link>
                          );
                        })}

                        {meta?.cta &&
                        (section.title !== "Tournoi" || showTournamentRegistration) ? (
                          <Link
                            href={meta.cta.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "inline-flex w-full items-center justify-center gap-2 rounded-[1rem] px-2.5 py-2.5 text-[13px] font-medium transition-colors",
                              palette.cta,
                            )}
                          >
                            <Sparkles className="h-3 w-3" />
                            {meta.cta.label}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </section>

            <section className="sticky bottom-3 z-10 mt-auto rounded-[0.95rem] border border-border/35 bg-background/45 p-1.5 backdrop-blur">
              <div
                className={cn(
                  "grid gap-1",
                  isAdmin && session ? "grid-cols-2" : "grid-cols-1",
                )}
              >
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-[0.8rem] border border-border/30 bg-background/50 px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/80">
                      <ShieldMinus className="h-3 w-3" />
                    </span>
                    <span className="truncate text-[12px] font-medium text-foreground/90">
                      Admin
                    </span>
                  </Link>
                ) : null}

                {session ? (
                  <Link
                    href="/user"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-[0.8rem] border border-border/30 bg-background/50 px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt="Avatar"
                        width={24}
                        height={24}
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/80">
                        <User2 className="h-3 w-3" />
                      </span>
                    )}
                    <span className="truncate text-[12px] font-medium text-foreground/90">
                      {session.user.name?.split(" ")[0] || "Mon espace"}
                    </span>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-[0.8rem] border border-border/30 bg-background/50 px-2 py-1.5 text-[12px] text-muted-foreground hover:bg-muted/45 hover:text-foreground"
                    asChild
                  >
                    <Link
                      href="/auth/signin?callbackUrl=/user"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogIn className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate text-left text-[12px] font-medium text-foreground/90">
                        Connexion
                      </span>
                    </Link>
                  </Button>
                )}
              </div>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
