"use client";

import { clubAdminMenuItems, tournamentAdminMenuItems } from "@/components/navigation/menu-items";

import SidebarNav from "@/components/sidebar/sidebar-nav";

const adminItems = [...clubAdminMenuItems, ...tournamentAdminMenuItems];

export default function AdminSidebar() {
  return <SidebarNav ariaLabel="Navigation administrateur" items={adminItems} />;
}
