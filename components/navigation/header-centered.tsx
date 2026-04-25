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
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import { getVisibleSections } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({
    Club: true,
    Tournoi: false,
  });

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
            "/club/comite-directeur": "Equipe dirigeante du club.",
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
  const logoSrc = isDark ? "/logo_trans.png" : "/logo_trans_dark.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setSectionOpen((prev) => ({
      Club: pathname.startsWith("/club") ? true : (prev.Club ?? true),
      Tournoi: pathname.startsWith("/tournoi")
        ? true
        : (prev.Tournoi ?? false),
    }));
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
                aria-label={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
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
                  className="inline-flex min-w-[5.25rem] items-center justify-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground"
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
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]">
                    Mon espace
                  </span>
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
            <div className="flex items-center gap-2.5">
              <Image
                src={logoSrc}
                alt="Logo CCTT"
                width={84}
                height={42}
                className="h-9 w-auto object-contain"
              />
              <div>
                <SheetTitle className="text-base leading-none">Navigation</SheetTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Menu principal du site.
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <section className="space-y-2">
              {publicSections.map((section) => {
                const meta =
                  section.title === "Club" || section.title === "Tournoi"
                    ? sectionMeta[section.title]
                    : null;
                const expanded = sectionOpen[section.title] ?? false;

                return (
                  <section key={section.title} className="space-y-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
                      onClick={() =>
                        setSectionOpen((prev) => ({
                          ...prev,
                          [section.title]: !expanded,
                        }))
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
                      <div className="space-y-0.5 pl-1">
                        {section.items.map((submenuItem) => {
                          const active = isItemActive(pathname, submenuItem.href);

                          return (
                            <Link
                              key={submenuItem.href}
                              href={submenuItem.href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                                active
                                  ? "bg-primary/10 text-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-full",
                                  active
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <submenuItem.icon className="h-3.5 w-3.5" />
                              </span>
                              <span>{submenuItem.label}</span>
                            </Link>
                          );
                        })}

                        {meta?.cta ? (
                          <Link
                            href={meta.cta.href}
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex items-center rounded-full px-2.5 pt-1 text-xs font-medium text-primary hover:underline"
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
                  <span>Administration tournoi</span>
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
