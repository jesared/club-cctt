"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

function HeaderContent() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isOpen = open;
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
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`relative z-40 border-b transition-colors duration-200 md:sticky md:top-0 ${
        isScrolled
          ? "bg-white/98 backdrop-blur shadow-md border-slate-200/80"
          : "bg-transparent border-transparent"
      }`}
    >
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
                className={`transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${
                  isActive ? "text-blue-700" : "text-slate-700"
                } ${isScrolled ? "hover:text-blue-700" : "hover:text-blue-600"}`}
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
          type="button"
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
      <Sidebar side="right" className="bg-white" aria-label="Menu principal">
        <SidebarHeader className="bg-white">
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
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="font-bold">Menu</span>
              <button
                type="button"
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
              >
                <Link href="/">Accueil</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  onClick={() => setOpen(false)}
                >
                  <Link href={item.href}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="px-6 pb-8">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-blue-700 px-4 py-2 text-center text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            >
              Nous rejoindre
            </Link>
          </div>
        </SidebarContent>
      </Sidebar>
    </header>
  );
}

export default function Header() {
  return (
    <SidebarProvider defaultOpen={false}>
      <HeaderContent />
    </SidebarProvider>
  );
}
