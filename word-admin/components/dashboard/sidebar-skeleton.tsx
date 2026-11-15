import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-2 p-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="mt-auto flex items-center gap-3 border-t p-4">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function MobileBarSkeleton() {
  return (
    <div className="flex h-14 items-center border-b px-4 lg:hidden">
      <Skeleton className="h-8 w-32" />
    </div>
  );
}
