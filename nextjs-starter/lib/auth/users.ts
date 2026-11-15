import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

export async function findUserByEmail(email: string) {
  const [row] = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email))
    .limit(1);

  return row ?? null;
}

export async function createUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);

  try {
    const [row] = await db
      .insert(appUsers)
      .values({ email, passwordHash })
      .returning({ id: appUsers.id, email: appUsers.email });

    return row ?? null;
  } catch {
    return null;
  }
}
