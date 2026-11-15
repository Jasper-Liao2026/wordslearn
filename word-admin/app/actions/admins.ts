"use server";

import { revalidatePath } from "next/cache";

import {
  createAdmin,
  deleteAdmin,
  updateAdmin,
} from "@/lib/admins";
import { requireSuperAdmin } from "@/lib/auth";
import type { AdminRole } from "@/lib/types";

export type AdminActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidRole(role: string): role is AdminRole {
  return role === "admin" || role === "super_admin";
}

export async function createAdminAction(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<AdminActionResult> {
  const permission = await requireSuperAdmin();
  if (!permission.ok) {
    return permission;
  }

  const fieldErrors: Record<string, string> = {};
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";

  if (!name) {
    fieldErrors.name = "请输入姓名";
  }

  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "请输入有效的邮箱地址";
  }

  if (password.length < 6) {
    fieldErrors.password = "密码长度至少为 6 位";
  }

  if (!isValidRole(input.role)) {
    fieldErrors.role = "请选择有效的角色";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "请检查表单内容", fieldErrors };
  }

  const created = await createAdmin({ name, email, password, role: input.role });
  if (!created) {
    return {
      ok: false,
      error: "该邮箱已被注册",
      fieldErrors: { email: "该邮箱已被注册" },
    };
  }

  revalidatePath("/admin-users");
  return { ok: true };
}

export async function updateAdminAction(input: {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  password?: string;
}): Promise<AdminActionResult> {
  const permission = await requireSuperAdmin();
  if (!permission.ok) {
    return permission;
  }

  const fieldErrors: Record<string, string> = {};
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password?.trim() ?? "";

  if (!name) {
    fieldErrors.name = "请输入姓名";
  }

  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "请输入有效的邮箱地址";
  }

  if (!isValidRole(input.role)) {
    fieldErrors.role = "请选择有效的角色";
  }

  if (password && password.length < 6) {
    fieldErrors.password = "密码长度至少为 6 位";
  }

  if (
    input.id === permission.admin.id &&
    input.role !== "super_admin"
  ) {
    fieldErrors.role = "不能修改当前登录账号的系统管理员角色";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "请检查表单内容", fieldErrors };
  }

  const result = await updateAdmin({
    id: input.id,
    name,
    email,
    role: input.role,
    password: password || undefined,
  });

  if (result.status === "email_taken") {
    return {
      ok: false,
      error: "该邮箱已被其他管理员使用",
      fieldErrors: { email: "该邮箱已被其他管理员使用" },
    };
  }

  if (result.status === "not_found") {
    return { ok: false, error: "管理员不存在或已被删除" };
  }

  revalidatePath("/admin-users");
  return { ok: true };
}

export async function deleteAdminAction(id: string): Promise<AdminActionResult> {
  const permission = await requireSuperAdmin();
  if (!permission.ok) {
    return permission;
  }

  if (id === permission.admin.id) {
    return { ok: false, error: "不能删除当前登录的管理员账号" };
  }

  const removed = await deleteAdmin(id);
  if (!removed) {
    return { ok: false, error: "管理员不存在或已被删除" };
  }

  revalidatePath("/admin-users");
  return { ok: true };
}
