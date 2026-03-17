"use client";

import { ChevronLeft, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import AuthButton from "@/components/AuthButton";
import { getVisibleSections, primaryCta, type MenuSection } from "@/components/navigation/menu-items";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import SidebarSection from "./SidebarSection";

const COLLAPSED_KEY = "app.sidebar.collapsed";
const SECTIONS_KEY = "app.sidebar.sections";

type SidebarProps = {
  mobile?: boolean;
};

function buildSectionState(sections: MenuSection[], pathname: string) {
  return sections.reduce<Record<string, boolean>>((acc, section) => {
    acc[section.title] = section.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    return acc;
  }, {});
}

export default function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sections = useMemo(
    () => getVisibleSections({ role: session?.user?.role, session: session ?? null }),
    [session],
  );

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mobile) {
      setOpenSections((current) =>
        Object.keys(current).length ? current : buildSectionState(sections, pathname),
      );
      return;
    }

    const storedCollapsed = window.localStorage.getItem(COLLAPSED_KEY);
    if (storedCollapsed) {
      setCollapsed(storedCollapsed === "1");
    }

    const storedSections = window.localStorage.getItem(SECTIONS_KEY);
    if (storedSections) {
      try {
        const parsed = JSON.parse(storedSections) as Record<string, boolean>;
        setOpenSections({ ...buildSectionState(sections, pathname), ...parsed });
        return;
      } catch {
        // noop
      }
    }

    setOpenSections(buildSectionState(sections, pathname));
  }, [mobile, pathname, sections]);

  useEffect(() => {
    if (!mobile) {
      window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    }
  }, [collapsed, mobile]);

  useEffect(() => {
    if (!mobile) {
      window.localStorage.setItem(SECTIONS_KEY, JSON.stringify(openSections));
    }
  }, [mobile, openSections]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }));
  };

  if (mobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>

          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {sections.map((section) => (
                <SidebarSection
                  key={section.title}
                  section={section}
                  collapsed={false}
                  open={Boolean(openSections[section.title])}
                  onToggle={() => toggleSection(section.title)}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </div>

            <div className="space-y-3 border-t p-4">
              <Link
                href={primaryCta.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
              >
                {primaryCta.label}
              </Link>
              <AuthButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r bg-background/95 md:flex md:flex-col",
        "transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && <p className="text-sm font-semibold">Navigation</p>}
        <Button
          size="icon"
          variant="ghost"
          aria-label="Réduire la sidebar"
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {sections.map((section) => (
          <SidebarSection
            key={section.title}
            section={section}
            collapsed={collapsed}
            open={Boolean(openSections[section.title])}
            onToggle={() => toggleSection(section.title)}
          />
        ))}
      </div>

      <div className="space-y-3 border-t p-3">
        {!collapsed && (
          <Link
            href={primaryCta.href}
            className="block rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
          >
            {primaryCta.label}
          </Link>
        )}
        <AuthButton collapsed={collapsed} />
      </div>
    </aside>
  );
}
