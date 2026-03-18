"use client";

import { Menu, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getVisibleSectionsHeader } from "@/components/navigation/menu-items";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

/* =========================
   HEADER
========================= */

function HeaderContent() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();

  const visibleSections = getVisibleSectionsHeader({
    role: (session?.user as { role?: string } | undefined)?.role,
    session: session ?? null,
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSections(
      visibleSections.reduce<Record<string, boolean>>((acc, section, index) => {
        acc[section.title] = index === 0;
        return acc;
      }, {}),
    );
  }, [visibleSections]);

  /* SCROLL EFFECT */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* CLOSE ON ROUTE CHANGE */
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all lg:hidden ${
        isScrolled
          ? "bg-background/95 backdrop-blur shadow-sm"
          : "bg-transparent"
      }`}
    >
      {/* TOP BAR */}
      <div className="flex h-14 items-center justify-between px-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="CCTT"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">CCTT</span>
            <span className="text-[11px] text-muted-foreground">Châlons</span>
          </div>
        </Link>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          {!session ? (
            <Button size="sm" onClick={() => void signIn("google")}>
              Connexion
            </Button>
          ) : (
            <Link
              href="/user"
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Mon espace
            </Link>
          )}

          <ThemeToggle />

          <SidebarTrigger asChild>
            <button aria-label="Menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SidebarTrigger>
        </div>
      </div>

      {/* SIDEBAR MOBILE */}
      <Sidebar side="right" className="bg-background">
        <SidebarHeader className="h-auto flex-col items-start gap-3 py-4">
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Fermer le menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="w-full rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Navigation rapide du site
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="flex-1 overflow-y-auto pb-2">
            {visibleSections.map((section) => {
              const isSectionOpen = openSections[section.title] ?? false;
              const sectionId = `section-${section.title.toLowerCase().replace(/\s+/g, "-")}`;

              return (
                <div
                  key={section.title}
                  className="mb-3 rounded-lg border bg-card/60"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections((prev) => ({
                        ...prev,
                        [section.title]: !isSectionOpen,
                      }))
                    }
                    className="flex w-full items-center justify-between px-3 py-3 text-left"
                    aria-expanded={isSectionOpen}
                    aria-controls={sectionId}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {isSectionOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isSectionOpen && (
                    <div id={sectionId} className="space-y-1 px-2 pb-2">
                      {section.items.map((item) => {
                        const active =
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/");

                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              onClick={() => setOpen(false)}
                              className="min-h-11"
                            >
                              <Link
                                href={item.href}
                                className="flex items-center justify-between"
                              >
                                <span>{item.label}</span>
                                {active ? (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                ) : null}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </SidebarMenu>

          {/* CTA + AUTH */}
          <div className="mt-auto space-y-2 border-t p-4">
            {!session ? (
              <button
                onClick={() => {
                  setOpen(false);
                  void signIn("google");
                }}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
              >
                Connexion
              </button>
            ) : (
              <>
                <Link
                  href="/user"
                  onClick={() => setOpen(false)}
                  className="block rounded-md border px-4 py-2 text-center hover:bg-accent"
                >
                  Mon espace
                </Link>

                <button
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="w-full rounded-md border px-4 py-2 hover:bg-accent"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </SidebarContent>
      </Sidebar>
    </header>
  );
}

export default function Header() {
  return <HeaderContent />;
}
