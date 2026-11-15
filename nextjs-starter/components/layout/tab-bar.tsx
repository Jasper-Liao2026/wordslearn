"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "首页", icon: BookOpen },
  { href: "/profile", label: "我的", icon: UserRound },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] items-stretch pb-safe">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              <span className={cn(active && "font-medium")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
