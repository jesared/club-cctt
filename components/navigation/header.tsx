"use client";

import { Home, Menu, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const publicNavItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/club", label: "Club" },
  { href: "/tournoi", label: "Tournoi" },
];

function UserMenu() {
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
        className="flex h-9 items-center gap-2 rounded-full px-2 hover:bg-accent"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt="Avatar"
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border bg-popover shadow-md">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-medium">
                {session.user?.name ?? "Utilisateur"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user?.email}
              </p>
            </div>

            <div className="p-1">
              <Link
                href="/user"
                className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Mon espace
              </Link>

              <button
                className="w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-accent"
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
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-sm"
          />
          <span className="hidden font-semibold md:block">CCTT</span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="ml-8 hidden md:flex items-center gap-1">
          {publicNavItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* MOBILE */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[260px] p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>CCTT</SheetTitle>
              </SheetHeader>

              <nav className="p-3">
                {publicNavItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                          active
                            ? "bg-accent"
                            : "hover:bg-muted text-muted-foreground",
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                    </SheetClose>
                  );
                })}

                <div className="mt-4 border-t pt-4">
                  <SheetClose asChild>
                    <Link
                      href={session ? "/user" : "/api/auth/signin"}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
                    >
                      <User className="h-4 w-4" />
                      {session ? "Mon espace" : "Connexion"}
                    </Link>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
