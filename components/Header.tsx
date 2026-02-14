"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

import {
  mainMenuItems,
  primaryCta,
} from "@/components/navigation/menu-items";
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

function HeaderContent() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isOpen = open;

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
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, setOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 lg:hidden ${
        isScrolled
          ? "bg-background/95 backdrop-blur shadow-sm border-border/80"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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
            <span className="text-base font-semibold">CCTT</span>
            <span className="text-[11px] text-muted-foreground">
              <span className="hidden md:inline">Châlons-en-Champagne</span>
              <span className="md:hidden">Châlons</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* BOUTON MOBILE */}
          <SidebarTrigger asChild>
            <button
              className="lg:hidden text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </SidebarTrigger>
        </div>
      </div>

      {/* MENU MOBILE */}
      <Sidebar side="right" className="bg-background" aria-label="Menu principal">
        <SidebarHeader className="bg-background">
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
            <X className="h-6 w-6" />
          </button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="flex-1 overflow-y-auto text-lg font-medium">
            {mainMenuItems.map((item) => (
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
          <div className="mt-auto px-6 pb-8">
            <Link
              href={primaryCta.href}
              onClick={() => setOpen(false)}
              className="block rounded-full bg-blue-700 px-4 py-2 text-center text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            >
              {primaryCta.label}
            </Link>
          </div>
        </SidebarContent>
      </Sidebar>
    </header>
  );
}

export default function Header() {
  return <HeaderContent />;
}
