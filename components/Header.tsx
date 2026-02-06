"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState(pathname);
  const isOpen = open && openPathname === pathname;
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
    if (!isOpen) return;
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
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b bg-transparent">
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
          onClick={() =>
            setOpen((prev) => {
              const next = !prev;
              if (next) {
                setOpenPathname(pathname);
              }
              return next;
            })
          }
          className="md:hidden text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MENU MOBILE */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 z-0 bg-slate-900/40 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="mobile-menu"
          className={`absolute right-0 top-0 z-10 flex h-full w-80 max-w-[85%] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="CCTT"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="font-bold">Menu</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8 gap-5 text-lg font-medium">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`transition-colors hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${
                pathname === "/" ? "text-blue-700" : "text-gray-700"
              }`}
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
            <div className="pt-4">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block rounded-full bg-blue-700 px-4 py-2 text-center text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              >
                Nous rejoindre
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
