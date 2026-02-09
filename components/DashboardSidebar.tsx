"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainMenuItems, primaryCta } from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:text-sidebar-foreground lg:overflow-y-auto",
        isCollapsed ? "lg:w-20" : "lg:w-72",
      )}
    >
      <div
        className={cn(
          "flex h-20 items-center gap-3 border-b border-sidebar-border px-6",
          isCollapsed && "justify-center px-3",
        )}
      >
        <Image
          src="/logo.jpg"
          alt="CCTT"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
        <div className={cn("flex flex-col", isCollapsed && "sr-only")}>
          <span className="text-sm font-semibold">CCTT</span>
          <span className="text-xs text-sidebar-foreground/60">
            Tableau de bord
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((value) => !value)}
          className={cn(
            "ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500",
            isCollapsed && "ml-0",
          )}
          aria-label={
            isCollapsed ? "Déplier la navigation" : "Replier la navigation"
          }
          aria-pressed={isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <div
        className={cn("flex flex-1 flex-col px-4 py-6", isCollapsed && "px-3")}
      >
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60",
            isCollapsed && "sr-only",
          )}
        >
          Navigation
        </p>
        <nav
          className={cn(
            "mt-4 flex flex-1 flex-col gap-1",
            isCollapsed && "items-center",
          )}
        >
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
                    "bg-sidebar-accent text-sidebar-accent-foreground",
                  isCollapsed ? "w-12 justify-center px-0" : "w-full",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className={cn(isCollapsed && "sr-only")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className={cn("mt-auto pt-6", isCollapsed && "pt-4")}>
          <Link
            href={primaryCta.href}
            className={cn(
              "block rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500",
              isCollapsed ? "w-12 px-0" : "w-full",
            )}
            aria-label={
              isCollapsed ? `${primaryCta.label} (raccourci)` : undefined
            }
          >
            <span className={cn(isCollapsed && "sr-only")}>
              {primaryCta.label}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
