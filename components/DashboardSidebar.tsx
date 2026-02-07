"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainMenuItems, primaryCta } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:text-sidebar-foreground">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
        <Image
          src="/logo.jpg"
          alt="CCTT"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">CCTT</span>
          <span className="text-xs text-sidebar-foreground/60">
            Tableau de bord
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 py-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60">
          Navigation
        </p>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="pt-6">
          <Link
            href={primaryCta.href}
            className="block rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
          >
            {primaryCta.label}
          </Link>
        </div>
      </div>
    </aside>
  );
}
