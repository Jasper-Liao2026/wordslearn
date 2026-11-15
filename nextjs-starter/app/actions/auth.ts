"use server";

import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/auth/users";

export type AuthResult = { ok: true } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "请输入有效的邮箱地址" };
  }
  if (password.length < 6) {
    return { ok: false, error: "密码长度至少为 6 位" };
  }

  if (await findUserByEmail(email)) {
    return { ok: false, error: "该邮箱已注册，请直接登录" };
  }

  const user = await createUser(email, password);
  if (!user) {
    return { ok: false, error: "注册失败，请稍后重试" };
  }

  await createSession(user.id);
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

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, error: "邮箱或密码错误" };
  }

  await createSession(user.id);
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  await destroySession();
}
