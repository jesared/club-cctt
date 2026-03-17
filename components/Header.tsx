"use client";

import { Menu, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSections } from "@/components/navigation/menu-items";

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

  const visibleSections = getVisibleSections({
    role: (session?.user as { role?: string } | undefined)?.role,
    session: session ?? null,
  });

  const [isScrolled, setIsScrolled] = useState(false);

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
        <SidebarHeader>
          <span className="font-semibold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="flex-1 overflow-y-auto">
            {visibleSections.map((section) => (
                <div key={section.title} className="mb-4">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase text-muted-foreground">
                    {section.title}
                  </p>

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
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              ))}
          </SidebarMenu>

          {/* CTA + AUTH */}
          <div className="mt-auto p-4 space-y-2">
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
