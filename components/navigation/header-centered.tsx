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
  const isDark = mounted ? resolvedTheme === "dark" : false;
  const logoSrc = isDark
    ? "/cctt_logo_trans_blanc.png"
    : "/logo_trans_light.png";

  useEffect(() => {
    setMounted(true);
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

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="relative flex min-h-[6.5rem] items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground",
                  menuOpen && "border-border bg-muted text-foreground",
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
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-colors",
                  isDark
                    ? "bg-white/10 text-amber-300 hover:bg-white/15"
                    : "bg-black/5 text-slate-700 hover:bg-black/10",
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

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 flex max-w-[calc(100%-11rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center"
            >
              <span className="inline-flex items-center justify-center px-2 py-1 drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                <Image
                  src={logoSrc}
                  alt="Logo CCTT"
                  width={240}
                  height={120}
                  className="h-[4.5rem] w-auto max-w-full object-contain sm:h-[5.25rem]"
                />
              </span>
            </Link>

            <div className="flex flex-col items-end justify-center gap-2">
              {session ? (
                <Link
                  href="/user"
                  aria-label="Mon espace"
                  title="Mon espace"
                  className="inline-flex items-center justify-center rounded-full border border-transparent px-2 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground"
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
                  className="h-10 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                  onClick={() => void signIn()}
                >
                  <LogIn className="h-4 w-4" />
                  Connexion
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
                  href="/admin/tournoi"
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
