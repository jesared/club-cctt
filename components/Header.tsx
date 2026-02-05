"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-white">
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
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-bold text-lg">CCTT</span>
            <span className="text-xs text-gray-500">Châlons-en-Champagne</span>
          </div>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/club">Le club</Link>
          <Link href="/horaires">Horaires</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href="/partenaires">Partenaires</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* BOUTON MOBILE */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden text-2xl"
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="font-bold">Menu</span>
            <button
              onClick={() => setOpen(false)}
              className="text-2xl"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8 gap-6 text-lg font-medium">
            <Link href="/" onClick={() => setOpen(false)}>
              Accueil
            </Link>
            <Link href="/club" onClick={() => setOpen(false)}>
              Le club
            </Link>
            <Link href="/horaires" onClick={() => setOpen(false)}>
              Horaires
            </Link>
            <Link href="/tarifs" onClick={() => setOpen(false)}>
              Tarifs
            </Link>
            <Link href="/partenaires" onClick={() => setOpen(false)}>
              Partenaires
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
