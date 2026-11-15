import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminUsersView } from "@/components/admins/admin-users-view";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { listAdmins } from "@/lib/admins";
import { requireSuperAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "管理员管理 · WordsLearn 管理后台",
};

export default function AdminUsersPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="管理员管理"
        description="管理系统管理员与普通管理员账号，仅系统管理员可访问本页。"
      />
      <Suspense fallback={<AdminUsersSkeleton />}>
        <AdminUsersSection />
      </Suspense>
    </div>
  );
}

async function AdminUsersSection() {
  const currentAdmin = await requireSuperAdminPage();
  const admins = await listAdmins();
  return <AdminUsersView admins={admins} currentAdmin={currentAdmin} />;
}

function AdminUsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[360px] rounded-xl" />
    </div>
  );
}
