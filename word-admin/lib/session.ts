import { randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { db } from "@/db";
import { adminSessions } from "@/db/schema";

const COOKIE_NAME = "word_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** 创建会话：数据库保存 token，有效期 7 天 */
export async function createSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  // 顺带清理已过期的会话
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db.insert(adminSessions).values({ token, adminId, expiresAt });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function readSession(): Promise<{ adminId: string } | null> {
  await connection();

  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const [session] = await db
    .select({
      adminId: adminSessions.adminId,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .where(eq(adminSessions.token, token))
    .limit(1);

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
    return null;
  }

  return { adminId: session.adminId };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }

  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
