"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

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
import { tournamentMenuItems } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/competitions", label: "Compétitions" },
  { href: "/horaires", label: "Horaires" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/club", label: "Club" },
  { href: "/evenements", label: "Événements" },
  { href: "/contact", label: "Contact" },
];

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session) {
    return (
      <Button size="sm" onClick={() => signIn("google")}>
        Se connecter
      </Button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-muted/40"
        aria-expanded={open}
        aria-label="Ouvrir le menu utilisateur"
      >
        {session.user?.image ? (
          <Image src={session.user.image} alt="Avatar" width={36} height={36} />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-background/20"
            aria-label="Fermer le menu utilisateur"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
            <div className="border-b px-2 py-2">
              <p className="text-sm font-medium">{session.user?.name ?? "Utilisateur"}</p>
              <p className="truncate text-xs text-muted-foreground">{session.user?.email}</p>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <Link
                href="/espace"
                className="rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Mon espace
              </Link>
              <button
                type="button"
                className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
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

export default function Header() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  const closeMobileMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Logo du club" width={36} height={36} className="rounded-sm" />
          <span className="hidden text-sm font-semibold md:inline">CCTT</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {mainNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "transition-colors hover:text-primary",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            <UserMenu />
          </div>

          <SidebarTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>
        </div>
      </div>

      <Sidebar
        side="right"
        className="border-l border-border bg-background"
        aria-label="Navigation mobile"
      >
        <SidebarHeader>
          <span className="text-sm font-semibold">Menu</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="gap-2 py-5">
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} onClick={closeMobileMenu}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Menu tournoi
            </p>
            {tournamentMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} onClick={closeMobileMenu}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="border-t p-4">
            <UserMenu />
          </div>
        </SidebarContent>
      </Sidebar>
    </header>
  );
}
