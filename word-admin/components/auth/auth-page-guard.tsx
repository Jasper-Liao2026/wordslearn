import { redirect } from "next/navigation";

import { hasAnyAdmin } from "@/lib/admins";
import { getCurrentAdmin } from "@/lib/auth";

/**
 * 登录 / 注册页的路由守卫：
 * - 已登录用户直接进入 /books
 * - 还没有任何管理员时，登录页跳转到 /signup（首位系统管理员注册）
 * - 已存在管理员时，注册页跳转到 /signin（不允许二次注册系统管理员）
 */
export async function AuthPageGuard({
  mode,
}: {
  mode: "signin" | "signup";
}) {
  const admin = await getCurrentAdmin();
  if (admin) {
    redirect("/books");
  }

  const hasAdmins = await hasAnyAdmin();

  if (mode === "signup" && hasAdmins) {
    redirect("/signin");
  }

  if (mode === "signin" && !hasAdmins) {
    redirect("/signup");
  }

  return null;
}
