"use server";

import { headers } from "next/headers";

import { verifyPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { createSession, destroySession } from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/auth/users";

export type AuthResult = { ok: true } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;

async function attemptKey(email: string) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "local";
  return `${ip}:${email}`;
}

export async function signUpAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase() ?? "";
  const password = input.password ?? "";

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "请输入有效的邮箱地址" };
  }
  if (!STRONG_PASSWORD.test(password)) {
    return { ok: false, error: "密码需 8–64 位，且同时包含字母和数字" };
  }
  if (!checkRateLimit(await attemptKey(email))) {
    return { ok: false, error: "操作过于频繁，请稍后再试" };
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
  if (password.length < 6 || password.length > 64) {
    return { ok: false, error: "密码长度为 6–64 位" };
  }
  if (!checkRateLimit(await attemptKey(email))) {
    return { ok: false, error: "操作过于频繁，请稍后再试" };
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
