import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      <header className="space-y-2 px-4 pb-4 pt-6">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3 w-36" />
      </header>

      <main className="space-y-6 px-4">
        <section className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </section>

        <section className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
