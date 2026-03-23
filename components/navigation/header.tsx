"use client";

import { ChevronDown, Home, ShieldMinus } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSections } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/roles";
import { isPublicRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

// 🔥 LOGIQUE ACTIVE (IDENTIQUE SIDEBAR)
function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";

  if (href === "/club" || href === "/tournoi") {
    return pathname === href;
  }

  // 👉 admin global
  if (href === "/admin") {
    return (
      pathname === "/admin" ||
      (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/tournoi"))
    );
  }

  // 👉 admin tournoi (prioritaire)
  if (href === "/admin/tournoi") {
    return pathname.startsWith("/admin/tournoi");
  }

  // 👉 default
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sectionMeta = useMemo(
    () => ({
      Club: {
        description: "Découvrir le club, ses horaires et ses tarifs.",
        cta: { href: "/club/contact", label: "Nous contacter" },
        items: {
          "/club/horaires": "Créneaux, salles et périodes d’ouverture.",
          "/club/tarifs": "Tarifs et formules d’adhésion.",
          "/club/partenaires": "Soutiens et partenaires du club.",
          "/club/comite-directeur": "Équipe dirigeante du club.",
          "/club/contact": "Contact et localisation.",
        },
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
        },
      },
    }),
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

  if (!isPublicRoute(pathname)) {
    return null;
  }

  const isAdmin = isAdminRole(session?.user?.role);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
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

                  {openSection === item.title ? (
                    <div className="absolute left-0 top-full z-50 mt-3 w-[520px] rounded-lg border bg-background shadow-xl">
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
                  ) : null}
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
          {isAdmin && (
            <Link
              href="/admin/tournoi"
              className="rounded-md border px-3 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <ShieldMinus className="h-4 w-4" />
            </Link>
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
    </header>
  );
}
