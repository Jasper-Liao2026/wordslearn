import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { hasAnyAdmin } from "@/lib/admins";
import { getCurrentAdmin } from "@/lib/auth";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-muted-foreground">
      <Suspense fallback={<Loader2 className="size-6 animate-spin" />}>
        <EntryRedirect />
      </Suspense>
      <p className="text-sm">正在跳转…</p>
    </div>
  );
}

async function EntryRedirect() {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/books");
  }

  redirect((await hasAnyAdmin()) ? "/signin" : "/signup");
  return null;
}
