import { requireAdmin } from "@/lib/auth";

import { MobileBar, SidebarContent } from "./sidebar-content";

export async function AppSidebar() {
  const admin = await requireAdmin();
  return <SidebarContent admin={admin} />;
}

export async function MobileNav() {
  const admin = await requireAdmin();
  return <MobileBar admin={admin} />;
}
