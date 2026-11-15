import { redirect } from "next/navigation";

import { findAdminById } from "./admins";
import { readSession } from "./session";
import type { AdminPublic } from "./types";

export async function getCurrentAdmin(): Promise<AdminPublic | null> {
  const session = await readSession();
  if (!session) {
    return null;
  }

  return findAdminById(session.adminId);
}

export async function requireAdmin(): Promise<AdminPublic> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/signin");
  }
  return admin;
}

/** 页面级校验：普通管理员访问管理员管理页时跳回单词书管理 */
export async function requireSuperAdminPage(): Promise<AdminPublic> {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") {
    redirect("/books");
  }
  return admin;
}

export async function requireSuperAdmin(): Promise<
  { ok: true; admin: AdminPublic } | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  if (admin.role !== "super_admin") {
    return { ok: false, error: "仅超级管理员可以执行此操作" };
  }
  return { ok: true, admin };
}
