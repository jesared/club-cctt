"use client";

import {
  ArrowRight,
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
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Club");
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

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

  async function signOutToHome() {
    await authClient.signOut();
    window.location.href = "/";
  }

  if (!isPublicRoute(pathname)) {
    return null;
  }

  const openNavigationSection = (sectionTitle: "Club" | "Tournoi") => {
    setOpenSection(sectionTitle);
    setMenuOpen(true);
  };

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
                  className="hidden rounded-full border border-stone-300/85 bg-stone-50 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-stone-900 shadow-[0_1px_0_rgba(255,255,255,0.78)_inset,0_8px_18px_rgba(41,37,36,0.08)] transition-all hover:-translate-y-px hover:border-stone-400/90 hover:bg-stone-100 hover:shadow-[0_1px_0_rgba(255,255,255,0.82)_inset,0_12px_22px_rgba(41,37,36,0.11)] dark:border-white/12 dark:bg-white/6 dark:bg-none dark:text-stone-100 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] dark:hover:border-white/18 dark:hover:bg-white/10 dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] md:inline-flex"
                >
                  S&apos;inscrire
                </Link>
              ) : null}

              {session ? (
                <div ref={accountMenuRef} className="relative">
                  <button
                    type="button"
                    aria-label="Ouvrir le menu du compte"
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                    className={cn(
                      "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-transparent text-sm text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground",
                      accountMenuOpen && "bg-muted/55 text-foreground",
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
                      "overflow-hidden rounded-[1.6rem] border px-2 py-2 transition-all duration-200",
                      palette.section,
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-[1.1rem] px-3 py-3 text-left transition-colors hover:bg-background/50"
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
                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            expanded ? palette.activeIcon : palette.icon,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          {meta ? (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/85">
                              {meta.eyebrow}
                            </p>
                          ) : null}
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {section.title}
                          </p>
                          {meta ? (
                            <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                              {meta.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-background/80 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                          {section.items.length}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            expanded ? "rotate-180" : "rotate-0",
                          )}
                        />
                      </div>
                    </button>

                    {expanded ? (
                      <div className="space-y-1.5 px-1 pb-1">
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
                                "group relative flex items-start gap-3 rounded-[1rem] px-3 py-3 text-sm transition-colors before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-full before:opacity-0",
                                active
                                  ? "before:opacity-100 shadow-sm"
                                  : "text-muted-foreground",
                                active ? palette.activeRow : palette.hoverRow,
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                  active
                                    ? palette.activeIcon
                                    : palette.icon,
                                )}
                              >
                                <submenuItem.icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-medium text-foreground">
                                  {submenuItem.label}
                                </span>
                                {helper ? (
                                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                                    {helper}
                                  </span>
                                ) : null}
                              </span>
                              <ArrowRight
                                className={cn(
                                  "ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all",
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
                              "inline-flex w-full items-center justify-center gap-2 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition-colors",
                              palette.cta,
                            )}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {meta.cta.label}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </section>

            <section className="sticky bottom-4 z-10 mt-auto space-y-2 rounded-[1.45rem] border border-border/70 bg-background/92 px-3 pb-3 pt-3.5 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.8)] backdrop-blur">
              <div className="px-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                  Session
                </p>
              </div>
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-[1rem] border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border/70 hover:bg-muted/45 hover:text-foreground"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <ShieldMinus className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">
                      Administration
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Outils de gestion du club
                    </span>
                  </span>
                </Link>
              ) : null}

              {session ? (
                <Link
                  href="/user"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-[1rem] border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border/70 hover:bg-muted/45 hover:text-foreground"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">
                      Mon espace
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Profil, documents et suivis
                    </span>
                  </span>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-[1rem] border border-transparent px-3 py-2.5 text-sm text-muted-foreground hover:border-border/70 hover:bg-muted/45 hover:text-foreground"
                  asChild
                >
                  <Link
                    href="/auth/signin?callbackUrl=/user"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="min-w-0 text-left">
                      <span className="block font-medium text-foreground">
                        Connexion
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Acceder a l'espace membre
                      </span>
                    </span>
                  </Link>
                </Button>
              )}
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
