import { TabBar } from "@/components/layout/tab-bar";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-16">
        {children}
      </div>
      <TabBar />
    </div>
  );
}
