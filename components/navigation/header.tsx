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
  { href: "/", icon: Home },
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
        className="flex h-9 items-center justify-center gap-2 rounded-full cursor-pointer px-3"
        aria-expanded={open}
        aria-label="Ouvrir le menu utilisateur"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt="Avatar"
            width={26}
            height={26}
            className="rounded-full"
          />
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
              <p className="text-sm font-medium">
                {session.user?.name ?? "Utilisateur"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <Link
                href="/user"
                className="rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Mon espace utilisateur
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
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Logo du club"
            width={36}
            height={36}
            className="rounded-sm"
          />
          <span className="hidden text-sm font-semibold md:inline">CCTT</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center gap-6 text-sm font-medium">
            {publicNavItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 transition-colors ",
                      active ? "" : "",
                    )}
                  >
                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                    <span>{item.label}</span>
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

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[86vw] max-w-sm p-0"
              aria-label="Navigation mobile"
            >
              <SheetHeader className="border-b px-5 py-4 text-left">
                <SheetTitle className="text-base">
                  <Link href="/" className="flex items-center gap-3">
                    <Image
                      src="/logo.jpg"
                      alt="Logo du club"
                      width={34}
                      height={34}
                      className="rounded-sm"
                    />
                    <span>CCTT</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="px-3 py-4" aria-label="Menu principal mobile">
                <ul className="flex flex-col gap-1">
                  {publicNavItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <li key={item.href}>
                        <SheetClose asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-foreground/90 hover:bg-muted",
                            )}
                          >
                            {item.icon ? (
                              <item.icon className="h-4 w-4" />
                            ) : null}
                            <span>{item.label}</span>
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}

                  <li>
                    <SheetClose asChild>
                      <Link
                        href={session ? "/user" : "/api/auth/signin"}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium transition-colors",
                          pathname.startsWith("/user")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/90 hover:bg-muted",
                        )}
                      >
                        <User className="h-4 w-4" />
                        <span>{session ? "User" : "Connexion"}</span>
                      </Link>
                    </SheetClose>
                  </li>
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
