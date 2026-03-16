"use client";

import { PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
};

type SidebarProps = {
  items: SidebarItem[];
  title?: string;
  userSection?: ReactNode;
};

export default function Sidebar({
  items,
  title = "Navigation",
  userSection,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const groupedItems = groupItemsBySection(items);

  return (
    <>
      {/* MOBILE BURGER */}
      <div className="mb-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <PanelLeft className="h-4 w-4" />
              {title}
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="fixed inset-y-0 left-0 z-50 w-[260px] p-4"
          >
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>

            <MobileSidebarNav
              title={title}
              groupedItems={groupedItems}
              onNavigate={() => setMobileOpen(false)}
            />

            {userSection && (
              <div className="mt-4 border-t pt-4">{userSection}</div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-screen w-[260px] flex-col border-r p-4 md:flex ">
        <DesktopSidebarNav groupedItems={groupedItems} title={title} />

        {userSection && (
          <div className="mt-auto border-t pt-4">{userSection}</div>
        )}
      </aside>
    </>
  );
}

function MobileSidebarNav({
  title,
  groupedItems,
  onNavigate,
}: {
  title: string;
  groupedItems: Array<{ section: string; items: SidebarItem[] }>;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto">
      {groupedItems.map((group) => (
        <div key={group.section} className="space-y-1">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.section}
          </p>

          {group.items.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function DesktopSidebarNav({
  groupedItems,
  title,
}: {
  groupedItems: Array<{ section: string; items: SidebarItem[] }>;
  title: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {groupedItems.map((group) => (
        <div key={group.section} className="space-y-3">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.section}
          </p>

          {group.items.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function groupItemsBySection(items: SidebarItem[]) {
  const groups = new Map<string, SidebarItem[]>();

  for (const item of items) {
    const section = item.section ?? "Navigation";
    const sectionItems = groups.get(section) ?? [];
    sectionItems.push(item);
    groups.set(section, sectionItems);
  }

  return Array.from(groups.entries()).map(([section, groupItems]) => ({
    section,
    items: groupItems,
  }));
}
