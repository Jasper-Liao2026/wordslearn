"use server";

import { redirect } from "next/navigation";

import { createAdmin, findAdminByEmail, hasAnyAdmin } from "@/lib/admins";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";

export type AuthResult = { ok: true } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpAction(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";
  const confirmPassword = input.confirmPassword ?? "";

  if (!name) {
    return { ok: false, error: "请输入姓名" };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "请输入有效的邮箱地址" };
  }
  if (password.length < 6) {
    return { ok: false, error: "密码长度至少为 6 位" };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "两次输入的密码不一致" };
  }

  // 仅允许注册首位系统管理员，已有管理员数据后不再开放注册
  if (await hasAnyAdmin()) {
    return { ok: false, error: "系统管理员已存在，请直接登录" };
  }

  const admin = await createAdmin({
    name,
    email,
    password,
    role: "super_admin",
  });
  if (!admin) {
    return { ok: false, error: "该邮箱已被注册" };
  }

  await createSession(admin.id);
  return { ok: true };
}

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { ok: false, error: "请输入邮箱和密码" };
  }

  const admin = await findAdminByEmail(email);
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { ok: false, error: "邮箱或密码错误" };
  }

  await createSession(admin.id);
  return { ok: true };
}

export async function signOutAction() {
  await destroySession();
  redirect("/signin");
}
