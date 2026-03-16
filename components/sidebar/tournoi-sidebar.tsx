import { tournamentMenuItems } from "@/components/navigation/menu-items";

import SidebarNav from "@/components/sidebar/sidebar-nav";

export default function TournoiSidebar() {
  return <SidebarNav ariaLabel="Navigation tournoi" items={tournamentMenuItems} />;
}
