"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import type { PublicMenuVisibility } from "@/lib/menu-settings";
import { isPublicRoute } from "@/lib/routes";

type RootChromeProps = {
  children: ReactNode;
  menuVisibility?: PublicMenuVisibility;
  showTournamentRegistration?: boolean;
};

export default function RootChrome({
  children,
  menuVisibility,
  showTournamentRegistration,
}: RootChromeProps) {
  const pathname = usePathname();

  if (!isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        menuVisibility={menuVisibility}
        showTournamentRegistration={showTournamentRegistration}
      />
      <main className="flex-1">{children}</main>
      <Footer menuVisibility={menuVisibility} />
    </div>
  );
}
