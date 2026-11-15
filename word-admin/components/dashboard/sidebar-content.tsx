"use client";

import { BookOpenText, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADMIN_ROLE_LABELS, type AdminPublic, type AdminRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/books", label: "单词书管理", icon: BookOpenText },
  { href: "/admin-users", label: "管理员管理", icon: Users },
];

/** 普通管理员不显示「管理员管理」入口 */
function navItemsFor(role: AdminRole) {
  return NAV_ITEMS.filter(
    (item) => item.href !== "/admin-users" || role === "super_admin"
  );
}

function initialsOf(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "A";
}

export function SidebarContent({ admin }: { admin: AdminPublic }) {
  const pathname = usePathname();
  const navItems = navItemsFor(admin.role);

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-2 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground">
          内容管理
        </p>
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initialsOf(admin.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{admin.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {ADMIN_ROLE_LABELS[admin.role]}
            </p>
          </div>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              title="退出登录"
              aria-label="退出登录"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
        <p
          className="mt-2 truncate rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground"
          title={admin.email}
        >
          {admin.email}
        </p>
      </div>
    </aside>
  );
}

export function MobileBar({ admin }: { admin: AdminPublic }) {
  const pathname = usePathname();
  const navItems = navItemsFor(admin.role);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:hidden">
      <Brand />
      <span className="ml-auto max-w-[160px] truncate text-xs text-muted-foreground">
        {admin.email}
      </span>
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "secondary" : "ghost"}
              size="icon"
            >
              <Link href={item.href} aria-label={item.label} title={item.label}>
                <item.icon className="size-4" />
              </Link>
            </Button>
          );
        })}
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="退出登录"
            title="退出登录"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </nav>
    </header>
  );
}
