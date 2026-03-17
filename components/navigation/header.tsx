"use client";

import { Home, Menu, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getVisibleSections } from "@/components/navigation/menu-items";
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
              <p className="truncate text-xs text-muted-foreground">
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
                className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
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

  const visibleSections = useMemo(
    () => getVisibleSections({ role: session?.user?.role, session: session ?? null }),
    [session],
  );

  const desktopLinks = useMemo(
    () => [
      { href: "/", label: "Accueil", icon: Home },
      ...visibleSections
        .map((section) => section.items[0])
        .filter((item): item is NonNullable<typeof item> => Boolean(item) && item.href !== "/")
        .map((item) => ({ href: item.href, label: item.label, icon: item.icon })),
    ],
    [visibleSections],
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6">
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

        <nav className="ml-8 hidden items-center gap-1 md:flex">
          {desktopLinks.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden md:block">
            <UserMenu />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>CCTT</SheetTitle>
              </SheetHeader>

              <nav className="space-y-4 p-3">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                      pathname === "/" ? "bg-accent" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Home className="h-4 w-4" />
                    Accueil
                  </Link>
                </SheetClose>

                {visibleSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <p className="px-2 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                      {section.title}
                    </p>

                    {section.items.map((item) => {
                      const active =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                              active ? "bg-accent" : "text-muted-foreground hover:bg-muted",
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                ))}

                <div className="border-t pt-4">
                  {!session ? (
                    <Button className="w-full" onClick={() => signIn("google")}>
                      Connexion
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <Link
                          href="/user"
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                          <User className="h-4 w-4" />
                          Mon espace
                        </Link>
                      </SheetClose>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setOpen(false);
                          void signOut();
                        }}
                      >
                        Déconnexion
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
