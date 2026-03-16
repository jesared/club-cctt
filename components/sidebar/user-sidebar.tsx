"use client";

import { userMenuItems } from "@/components/navigation/menu-items";

import SidebarNav from "@/components/sidebar/sidebar-nav";

export default function UserSidebar() {
  return <SidebarNav ariaLabel="Navigation utilisateur" items={userMenuItems} />;
}
