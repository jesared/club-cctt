"use client";

import {
  Banknote,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  ClipboardPen,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  type MenuItem,
  mainMenuItems,
} from "@/components/navigation/menu-items";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import AuthButton from "./AuthButton";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuGroups, setMenuGroups] = useState({
    club: true,
    tournament: true,
    adminClub: false,
    adminTournament: false,
  });

  const toggleMenuGroup = (group: keyof typeof menuGroups) => {
    setMenuGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const clubMenuItems = mainMenuItems;
  const tournamentMenuItems: MenuItem[] = [
    { href: "/tournoi", label: "Accueil tournoi", icon: Trophy },
    { href: "/tournoi/inscription", label: "Inscription", icon: ClipboardPen },
    { href: "/tournoi/reglement", label: "Règlement", icon: FileText },
  ];

  const clubAdminMenuItems = [
    { href: "/admin", label: "Administration", icon: Shield },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
  ];

  const tournamentAdminMenuItems = [
    { href: "/admin/tournoi", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/tournoi/inscriptions",
      label: "Inscriptions",
      icon: ClipboardPen,
    },
    { href: "/admin/tournoi/paiement", label: "Paiements", icon: Banknote },
    { href: "/admin/tournoi/pointages", label: "Pointages", icon: CalendarCheck },
    { href: "/admin/tournoi/joueurs", label: "Joueurs", icon: Users },
    {
      href: "/admin/tournoi/ajout-player",
      label: "Ajouter un joueur",
      icon: UserPlus,
    },
    { href: "/admin/tournoi/exports", label: "Exports", icon: Download },
  ];

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:text-sidebar-foreground lg:overflow-y-auto",
        isCollapsed ? "lg:w-16" : "lg:w-72",
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
      <div className={cn("flex flex-1 flex-col px-4 py-6", isCollapsed && "hidden")}>
        <nav
          className={cn("mt-1 flex flex-1 flex-col", isCollapsed && "items-center")}
        >
          <p
            className={cn("mb-3", isCollapsed && "sr-only")}
          >
            <button
              type="button"
              onClick={() => toggleMenuGroup("club")}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60"
              aria-expanded={menuGroups.club}
              aria-controls="menu-group-club"
            >
              <span>Site du club</span>
              {menuGroups.club ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </p>

          {menuGroups.club && (
            <div
              id="menu-group-club"
              className={cn("flex flex-col gap-1", isCollapsed && "items-center")}
            >
              {clubMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                      isCollapsed ? "w-12 justify-center px-0" : "w-full",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {tournamentMenuItems.length > 0 && (
            <>
              <p
                className={cn("mb-3 mt-4", isCollapsed && "sr-only")}
              >
                <button
                  type="button"
                  onClick={() => toggleMenuGroup("tournament")}
                  className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60"
                  aria-expanded={menuGroups.tournament}
                  aria-controls="menu-group-tournament"
                >
                  <span>Tournoi</span>
                  {menuGroups.tournament ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </p>

              {menuGroups.tournament && (
                <div
                  id="menu-group-tournament"
                  className={cn("flex flex-col gap-1", isCollapsed && "items-center")}
                >
                  {tournamentMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                          isCollapsed ? "w-12 justify-center px-0" : "w-full",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {isAdmin && (
            <>
              <div
                className={cn("my-4 h-px bg-sidebar-border", isCollapsed && "w-10")}
              />
              <p
                className={cn("mb-3", isCollapsed && "sr-only")}
              >
                <button
                  type="button"
                  onClick={() => toggleMenuGroup("adminClub")}
                  className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-red-600/80"
                  aria-expanded={menuGroups.adminClub}
                  aria-controls="menu-group-admin-club"
                >
                  <span>Admin club</span>
                  {menuGroups.adminClub ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </p>

              {menuGroups.adminClub && (
                <div
                  id="menu-group-admin-club"
                  className={cn("flex flex-col gap-1", isCollapsed && "items-center")}
                >
                  {clubAdminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-red-500/10 hover:text-red-600",
                          isActive && "bg-red-500/10 text-red-600",
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
                </div>
              )}

              <p
                className={cn("mb-3 mt-4", isCollapsed && "sr-only")}
              >
                <button
                  type="button"
                  onClick={() => toggleMenuGroup("adminTournament")}
                  className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-red-600/80"
                  aria-expanded={menuGroups.adminTournament}
                  aria-controls="menu-group-admin-tournament"
                >
                  <span>Tournoi admin</span>
                  {menuGroups.adminTournament ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>
              </p>

              {menuGroups.adminTournament && (
                <div
                  id="menu-group-admin-tournament"
                  className={cn("flex flex-col gap-1", isCollapsed && "items-center")}
                >
                  {tournamentAdminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-red-500/10 hover:text-red-600",
                          isActive && "bg-red-500/10 text-red-600",
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
                </div>
              )}
            </>
          )}
        </nav>
        <AuthButton />
      </div>
    </aside>
  );
}
