import { Suspense } from "react";

import { AppSidebar, MobileNav } from "@/components/dashboard/app-sidebar";
import {
  MobileBarSkeleton,
  SidebarSkeleton,
} from "@/components/dashboard/sidebar-skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-muted/30">
      <Suspense fallback={<SidebarSkeleton />}>
        <AppSidebar />
      </Suspense>

      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<MobileBarSkeleton />}>
          <MobileNav />
        </Suspense>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
