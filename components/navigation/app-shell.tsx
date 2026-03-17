"use client";

import { Menu, Search } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import Sidebar, { type SidebarState } from "@/components/navigation/Sidebar";
import { getVisibleSections, type MenuSection } from "@/components/navigation/menu-items";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_STATE_KEY = "sidebar_state";
const SIDEBAR_SECTIONS_KEY = "app.sidebar.sections";

function buildSectionState(sections: MenuSection[], pathname: string) {
  return sections.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.title] = section.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    return acc;
  }, {});
}

function resolvePageTitle(pathname: string, sections: MenuSection[], fallback: string) {
  for (const section of sections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.label;
      }
    }
  }

  return fallback;
}

function HeaderUserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) {
    return (
      <Button size="sm" onClick={() => signIn("google")}>
        Connexion
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 items-center gap-2 rounded-full border bg-background px-2 transition-colors hover:bg-muted"
      >
        {session.user?.image ? (
          <Image src={session.user.image} alt="Avatar" width={28} height={28} className="rounded-full" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {(session.user?.name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu utilisateur"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border bg-popover p-1 shadow-lg">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-medium">{session.user?.name ?? "Utilisateur"}</p>
              <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
            </div>

            <div className="p-1">
              <Link
                href="/user"
                className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                Mon espace
              </Link>
              <button
                className="w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type AppShellProps = {
  children: ReactNode;
  title: string;
};

export default function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sections = useMemo(
    () => getVisibleSections({ role: session?.user?.role, session: session ?? null }),
    [session],
  );

  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedSidebarState = window.localStorage.getItem(SIDEBAR_STATE_KEY);
    if (storedSidebarState === "expanded" || storedSidebarState === "collapsed" || storedSidebarState === "hidden") {
      setSidebarState(storedSidebarState);
    }

    const sectionState = buildSectionState(sections, pathname);
    const storedSections = window.localStorage.getItem(SIDEBAR_SECTIONS_KEY);

    if (storedSections) {
      try {
        const parsed = JSON.parse(storedSections) as Record<string, boolean>;
        setOpenSections({ ...sectionState, ...parsed });
        return;
      } catch {
        setOpenSections(sectionState);
        return;
      }
    }

    setOpenSections(sectionState);
  }, [pathname, sections]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STATE_KEY, sidebarState);
  }, [sidebarState]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(openSections));
  }, [openSections]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const pageTitle = useMemo(() => resolvePageTitle(pathname, sections, title), [pathname, sections, title]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        sections={sections}
        openSections={openSections}
        onToggleSection={(sectionTitle) =>
          setOpenSections((current) => ({
            ...current,
            [sectionTitle]: !current[sectionTitle],
          }))
        }
        sidebarState={sidebarState}
        onToggleCollapse={() => setSidebarState((current) => (current === "collapsed" ? "expanded" : "collapsed"))}
        onHide={() => setSidebarState("hidden")}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Ouvrir la navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            {sidebarState === "hidden" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                aria-label="Afficher la barre latérale"
                aria-expanded={false}
                onClick={() => setSidebarState("expanded")}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h1 className="truncate text-sm font-semibold md:text-base">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <label className="relative hidden w-64 items-center md:flex">
              <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher..."
                className={cn(
                  "h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm",
                  "placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              />
            </label>
            <ThemeToggle />
            <HeaderUserMenu />
          </div>
        </header>

        <main className="app-scroll flex-1 overflow-y-auto px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
