"use client";

import {
  ChevronDown,
  LogIn,
  Menu,
  Moon,
  ShieldMinus,
  Sun,
  User2,
  X,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getVisibleSections } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
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
};

export default function HeaderCentered({ menuVisibility }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Club");

  const sectionMeta = useMemo(
    () =>
      ({
        Club: {
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
        }),
    [menuVisibility, session],
  );

  const isAdmin = isAdminRole(session?.user?.role);
  const tournoiVisible = isPublicMenuVisible(menuVisibility, "tournoi");
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const logoSrc = isDark
    ? "/cctt_logo_trans_blanc.png"
    : "/logo_trans_light.png";

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
      router.prefetch("/tournoi/inscription");
      router.prefetch("/tournoi/liste-inscrits");
    }
    if (isAdmin) {
      router.prefetch("/admin/tournoi");
      router.prefetch("/admin/tournoi/paiement");
      router.prefetch("/admin/tournoi/pointages");
    }
  }, [isAdmin, menuVisibility, pathname, router]);

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
                      <button
                        key={section.title}
                        type="button"
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen && openSection === section.title}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 font-medium tracking-[0.01em] transition-colors",
                          active
                            ? "bg-slate-100/85 text-slate-900 dark:bg-slate-400/10 dark:text-white"
                            : "text-muted-foreground hover:bg-muted/45 hover:text-foreground",
                        )}
                        onClick={() => openNavigationSection("Club")}>
                        {desktopLabels.Club}
                      </button>
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
                      <button
                        key={section.title}
                        type="button"
                        aria-haspopup="dialog"
                        aria-expanded={menuOpen && openSection === section.title}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-[0.925rem] font-medium tracking-normal whitespace-nowrap transition-colors",
                          active
                            ? "bg-stone-100/90 text-stone-900 dark:bg-stone-400/10 dark:text-white"
                            : "text-muted-foreground hover:bg-muted/45 hover:text-foreground",
                        )}
                        onClick={() => openNavigationSection("Tournoi")}>
                        {desktopLabels.Tournoi}
                      </button>
                    );
                  })}
              </div>
            </div>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background/95 px-3 py-1 text-center shadow-sm ring-1 ring-border/50 md:hidden"
            >
              <span className="inline-flex items-center justify-center drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                <Image
                  src={logoSrc}
                  alt="Logo CCTT"
                  width={240}
                  height={120}
                  priority
                  sizes="176px"
                  className={cn(
                    "h-auto w-auto max-w-[10.5rem] object-contain transition-all duration-200",
                    scrolled
                      ? "max-h-[2.55rem]"
                      : "max-h-[2.9rem]",
                  )}
                />
              </span>
            </Link>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 hidden max-w-[calc(100%-11rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center md:flex"
            >
              <span className="inline-flex items-center justify-center px-2 py-1 drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                <Image
                  src={logoSrc}
                  alt="Logo CCTT"
                  width={240}
                  height={120}
                  className={cn(
                    "w-auto max-w-full object-contain transition-all duration-200",
                    scrolled ? "h-[3.95rem]" : "h-[4.65rem]",
                  )}
                />
              </span>
            </Link>

            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
              {tournoiVisible ? (
                <Link
                  href="/tournoi/inscription"
                  className="hidden rounded-full border border-stone-300/85 bg-stone-50 px-4 py-2 text-sm font-semibold tracking-[0.02em] text-stone-900 shadow-[0_1px_0_rgba(255,255,255,0.78)_inset,0_8px_18px_rgba(41,37,36,0.08)] transition-all hover:-translate-y-px hover:border-stone-400/90 hover:bg-stone-100 hover:shadow-[0_1px_0_rgba(255,255,255,0.82)_inset,0_12px_22px_rgba(41,37,36,0.11)] dark:border-white/12 dark:bg-white/6 dark:bg-none dark:text-stone-100 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] dark:hover:border-white/18 dark:hover:bg-white/10 dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] md:inline-flex"
                >
                  S'inscrire
                </Link>
              ) : null}

              {session ? (
                <Link
                  href="/user"
                  aria-label="Mon espace"
                  title="Mon espace"
                  className="inline-flex items-center justify-center rounded-full border border-transparent px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Avatar"
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <User2 className="h-4 w-4" />
                  )}
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 rounded-full border border-transparent px-2.5 text-sm text-slate-600 transition-colors hover:bg-muted/35 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white"
                  onClick={() => void signIn()}
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Connexion</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SheetContent
        id="header-centered-menu"
        side="left"
        className="w-full max-w-[340px] overflow-y-auto border-r bg-background px-0 sm:max-w-[360px]"
      >
        <div className="px-4 pb-5 pt-14 sm:px-4">
          <SheetHeader className="mb-4 border-b pb-3">
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg leading-none">Navigation</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Retrouvez rapidement les pages utiles du club et du tournoi.
              </p>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <section className="space-y-2">
              {publicSections.map((section) => {
                const meta =
                  section.title === "Club" || section.title === "Tournoi"
                    ? sectionMeta[section.title]
                    : null;
                const expanded = openSection === section.title;
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
                      "rounded-2xl border px-2 py-2 transition-colors",
                      palette.section,
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-background/50"
                      onClick={() =>
                        setOpenSection((prev) =>
                          prev === section.title ? null : section.title,
                        )
                      }
                      aria-expanded={expanded}
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {section.title}
                        </p>
                        {meta ? (
                          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                            {meta.description}
                          </p>
                        ) : null}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expanded ? "rotate-180" : "rotate-0",
                        )}
                      />
                    </button>

                    {expanded ? (
                      <div className="space-y-1 px-1 pb-1">
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
                                "relative flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition-colors before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-full before:opacity-0",
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
                            </Link>
                          );
                        })}

                        {meta?.cta ? (
                          <Link
                            href={meta.cta.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                              palette.cta,
                            )}
                          >
                            {meta.cta.label}
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </section>

            <section className="space-y-2 border-t pt-3.5">
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                    <ShieldMinus className="h-3.5 w-3.5" />
                  </span>
                  <span>Administration</span>
                </Link>
              ) : null}

              {session ? (
                <Link
                  href="/user"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <User2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span>Mon espace</span>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-full justify-start rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setMenuOpen(false);
                    void signIn();
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
                </Button>
              )}
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
