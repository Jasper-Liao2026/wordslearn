import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { appSessions, appUsers } from "@/db/schema";

const COOKIE_NAME = "wordslearn_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  createdAt: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.delete(appSessions).where(lt(appSessions.expiresAt, new Date()));
  await db.insert(appSessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** 读取当前登录用户（无会话或已过期返回 null） */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const [row] = await db
    .select({
      id: appUsers.id,
      email: appUsers.email,
      createdAt: appUsers.createdAt,
    })
    .from(appSessions)
    .innerJoin(appUsers, eq(appSessions.userId, appUsers.id))
    .where(
      and(
        eq(appSessions.tokenHash, hashToken(token)),
        gt(appSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    await db
      .delete(appSessions)
      .where(eq(appSessions.tokenHash, hashToken(token)));
  }

  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
