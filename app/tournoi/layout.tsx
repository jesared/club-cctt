import type { ReactNode } from "react";

import TournoiSidebarNav from "@/components/tournoi/sidebar-nav";

export default function TournoiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
      <TournoiSidebarNav />
      <div>{children}</div>
    </div>
  );
}
