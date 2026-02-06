"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuItems = useMemo(
    () => [
      { href: "/club", label: "Le club" },
      { href: "/comite-directeur", label: "Comité directeur" },
      { href: "/horaires", label: "Horaires" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/partenaires", label: "Partenaires" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="CCTT"
            width={44}
            height={44}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg">CCTT</span>
            <span className="text-xs text-gray-500">
              <span className="hidden sm:inline">Châlons-en-Champagne</span>
              <span className="sm:hidden">Châlons</span>
            </span>
          </div>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${
                  isActive ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="rounded-full bg-blue-700 px-4 py-2 text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          >
            Nous rejoindre
          </Link>
        </nav>

        {/* BOUTON MOBILE */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="md:hidden text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-0 bg-slate-900/40"
          />
          <div
            id="mobile-menu"
            className="absolute right-0 top-0 z-10 h-full w-72 max-w-[80%] overflow-y-auto bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="font-bold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col px-6 py-8 gap-6 text-lg font-medium">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="text-gray-700 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              >
                Accueil
              </Link>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`transition-colors hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${
                    pathname === item.href ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-full bg-blue-700 px-4 py-2 text-center text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              >
                Nous rejoindre
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
