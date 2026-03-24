"use client";

import { ChevronDown, Home, Menu, ShieldMinus } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSections } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/roles";
import { isPublicRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

// ðŸ”¥ LOGIQUE ACTIVE (IDENTIQUE SIDEBAR)
function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/club" || href === "/tournoi") {
    return pathname === href;
  }

  // ðŸ‘‰ admin global
  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/tournoi"))
    );
  }

  // ðŸ‘‰ admin tournoi (prioritaire)
  if (href === "/admin/tournoi") {
    return pathname.startsWith("/admin/tournoi");
  }

  // ðŸ‘‰ default
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const sectionMeta = useMemo(
    () =>
      ({
      Club: {
        description: "Découvrir le club, ses horaires et ses tarifs.",
        cta: { href: "/club/contact", label: "Nous contacter" },
        items: {
          "/club/horaires": "Créneaux, salles et périodes d’ouverture.",
          "/club/tarifs": "Tarifs et formules d’adhésion.",
          "/club/partenaires": "Soutiens et partenaires du club.",
          "/club/comite-directeur": "Équipe dirigeante du club.",
          "/club/contact": "Contact et localisation.",
        } as Record<string, string>,
      },
      Tournoi: {
        description: "Infos, inscription et résultats du tournoi.",
        cta: { href: "/tournoi/inscription", label: "S’inscrire au tournoi" },
        items: {
          "/tournoi": "Présentation et dates clés.",
          "/tournoi/inscription": "Formulaire d’inscription en ligne.",
          "/tournoi/liste-inscrits": "Liste des participants.",
          "/tournoi/resultats": "Résultats et classements.",
          "/tournoi/palmares": "Palmarès des éditions précédentes.",
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
      }).filter((section) =>
        section.items.every(
          (item) =>
            item.href.startsWith("/club") || item.href.startsWith("/tournoi"),
        ),
      ),
    [session],
  );

  const desktopLinks = useMemo(
    () => [{ href: "/", label: "Accueil", icon: Home }, ...publicSections],
    [publicSections],
  );

  useEffect(() => {
    function handleOutside(event: MouseEvent | TouchEvent) {
      if (!headerRef.current) return;
      if (headerRef.current.contains(event.target as Node)) return;
      setOpenSection(null);
      setMobileOpen(false);
      setMobileSection(null);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  useEffect(() => {
    setOpenSection(null);
    setMobileOpen(false);
    setMobileSection(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  if (!isPublicRoute(pathname)) {
    return null;
  }

  const isAdmin = isAdminRole(session?.user?.role);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur"
    >
      <div className="flex h-16 items-center px-4 md:px-6 mx-auto w-full max-w-7xl">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Logo" width={32} height={32} />
          <span className="hidden font-semibold md:block">CCTT</span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="ml-8 hidden items-center gap-2 md:flex">
          {desktopLinks.map((item) => {
            if ("items" in item) {
              const section = publicSections.find(
                (entry) => entry.title === item.title,
              );
              const meta =
                section?.title === "Club" || section?.title === "Tournoi"
                  ? sectionMeta[section.title]
                  : null;
              const rootHref =
                section?.title === "Club"
                  ? "/club"
                  : section?.title === "Tournoi"
                    ? "/tournoi"
                    : null;
              const isParentActive = rootHref ? pathname === rootHref : false;
              if (!section) {
                return null;
              }

              return (
                <div key={item.title} className="relative group">
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
                      isParentActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    aria-haspopup="menu"
                    aria-expanded={openSection === item.title}
                    onClick={() =>
                      setOpenSection((prev) =>
                        prev === item.title ? null : item.title,
                      )
                    }
                  >
                    <span className="text-sm">{item.title}</span>
                    <span
                      className={cn(
                        "transition-transform duration-200",
                        openSection === item.title ? "rotate-180" : "rotate-0",
                      )}
                    >
                      <ChevronDown className="h-4 w-4 opacity-80" />
                    </span>
                  </button>

                  <div
                    className={cn(
                      "absolute left-0 top-full z-50 mt-3 w-[520px] rounded-lg border bg-background shadow-xl transition-all duration-200",
                      openSection === item.title
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-1 pointer-events-none",
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {section.title}
                          </p>
                          {meta ? (
                            <p className="text-xs text-muted-foreground">
                              {meta.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
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
                            onClick={() => setOpenSection(null)}
                            className={cn(
                              "rounded-md border border-transparent px-3 py-2 transition-colors",
                              active
                                ? "bg-muted text-foreground"
                                : "hover:border-border hover:bg-muted/60 text-muted-foreground",
                              )}
                            >
                              <div className="text-sm font-medium text-foreground">
                                {submenuItem.label}
                              </div>
                              {helper ? (
                                <div className="text-xs text-muted-foreground">
                                  {helper}
                                </div>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>

                      {meta?.cta ? (
                        <div className="mt-4 border-t pt-3">
                          <Link
                            href={meta.cta.href}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                          >
                            {meta.cta.label}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            }

            const active = isItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="md:hidden inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-foreground hover:bg-muted"
            aria-expanded={mobileOpen}
            aria-controls="mobile-mega-menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
            <span
              className={cn(
                "transition-transform duration-200",
                mobileOpen ? "rotate-180" : "rotate-0",
              )}
            >
              <ChevronDown className="h-4 w-4 opacity-80" />
            </span>
          </button>

          {isAdmin && (
            <>
              <Link
                href="/admin/tournoi"
                className="hidden sm:inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <ShieldMinus className="h-4 w-4" />
                Admin
              </Link>
              <Link
                href="/admin/tournoi/templates"
                className="hidden sm:inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Templates
              </Link>
              <Link
                href="/admin/tournoi"
                className="sm:hidden inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              >
                <ShieldMinus className="h-4 w-4" />
              </Link>
            </>
          )}
          {!session ? (
            <Button size="sm" onClick={() => void signIn("google")}>
              Connexion
            </Button>
          ) : (
            <Link href="/user" className="rounded-md px-3 py-2 text-sm">
              <Image
                src={session.user.image || "/default-avatar.png"}
                alt="Avatar"
                width={40}
                height={40}
                className={cn("rounded-full", "h-8 w-8")}
              />
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* NAV MOBILE */}
      <div
        id="mobile-mega-menu"
        className={cn(
          "md:hidden border-t bg-background/95 backdrop-blur transition-[max-height,opacity] duration-200 overflow-hidden",
          mobileOpen
            ? "max-h-[calc(100dvh-4rem)] opacity-100"
            : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="px-4 py-4 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <Link
            href="/"
            onClick={() => {
              setMobileOpen(false);
              setMobileSection(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isItemActive(pathname, "/")
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>

          {isAdmin && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Admin tournoi
              </p>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/admin/tournoi"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileSection(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/tournoi/templates"
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileSection(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  Templates
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Accès rapide
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link
                href="/club/horaires"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSection(null);
                }}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Horaires
              </Link>
              <Link
                href="/club/tarifs"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSection(null);
                }}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Tarifs
              </Link>
              <Link
                href="/club/contact"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSection(null);
                }}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Contact
              </Link>
              <Link
                href="/tournoi/inscription"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSection(null);
                }}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Inscription tournoi
              </Link>
            </div>
          </div>

          {publicSections.map((section) => {
            const meta =
              section.title === "Club" || section.title === "Tournoi"
                ? sectionMeta[section.title]
                : null;
            const expanded = mobileSection === section.title;

            return (
              <div
                key={section.title}
                className="rounded-lg border bg-background"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-3 text-sm font-medium text-foreground"
                  onClick={() =>
                    setMobileSection((prev) =>
                      prev === section.title ? null : section.title,
                    )
                  }
                  aria-expanded={expanded}
                >
                  <div className="flex flex-col text-left">
                    <span>{section.title}</span>
                    {meta ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        {meta.description}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      expanded ? "rotate-180" : "rotate-0",
                    )}
                  >
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  </span>
                </button>

                <div
                  className={cn(
                    "grid gap-2 px-3 pb-4 text-sm transition-[max-height,opacity] duration-200 overflow-hidden",
                    expanded ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  {section.items.map((submenuItem) => {
                    const active = isItemActive(pathname, submenuItem.href);
                    const helper = meta?.items?.[submenuItem.href];

                    return (
                      <Link
                        key={submenuItem.href}
                        href={submenuItem.href}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileSection(null);
                        }}
                        className={cn(
                          "rounded-md border border-transparent px-3 py-3 transition-colors",
                          active
                            ? "bg-muted text-foreground"
                            : "hover:border-border hover:bg-muted/60 text-muted-foreground",
                        )}
                      >
                        <div className="text-sm font-medium text-foreground">
                          {submenuItem.label}
                        </div>
                        {helper ? (
                          <div className="text-xs text-muted-foreground">
                            {helper}
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}

                  {meta?.cta ? (
                    <Link
                      href={meta.cta.href}
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileSection(null);
                      }}
                      className="mt-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
                    >
                      {meta.cta.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}





