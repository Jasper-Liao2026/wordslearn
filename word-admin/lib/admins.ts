import { asc, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "./password";
import type { AdminPublic, AdminRole } from "./types";

export type AdminRecord = typeof adminUsers.$inferSelect;

function toPublic(admin: AdminRecord): AdminPublic {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt.toISOString(),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

/** 是否已经存在任意管理员账号（用于首位系统管理员注册判断） */
export async function hasAnyAdmin(): Promise<boolean> {
  const rows = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  return rows.length > 0;
}

export async function countSuperAdmins(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(adminUsers)
    .where(eq(adminUsers.role, "super_admin"));
  return Number(row?.value ?? 0);
}

export async function listAdmins(): Promise<AdminPublic[]> {
  const admins = await db
    .select()
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt));
  return admins.map(toPublic);
}

export async function findAdminByEmail(
  email: string
): Promise<AdminRecord | null> {
  const normalized = email.trim().toLowerCase();
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, normalized))
    .limit(1);
  return admin ?? null;
}

export async function findAdminById(id: string): Promise<AdminPublic | null> {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return admin ? toPublic(admin) : null;
}

export async function createAdmin(input: {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}): Promise<AdminPublic | null> {
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  try {
    const [created] = await db
      .insert(adminUsers)
      .values({
        name: input.name.trim(),
        email,
        passwordHash,
        role: input.role ?? "admin",
      })
      .returning();

    return toPublic(created);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return null;
    }
    throw error;
  }
}

export type UpdateAdminResult =
  | { status: "updated"; admin: AdminPublic }
  | { status: "not_found" }
  | { status: "email_taken" };

export async function updateAdmin(input: {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  password?: string;
}): Promise<UpdateAdminResult> {
  const email = input.email.trim().toLowerCase();

  const [sameEmail] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (sameEmail && sameEmail.id !== input.id) {
    return { status: "email_taken" };
  }

  const values: Partial<typeof adminUsers.$inferInsert> = {
    name: input.name.trim(),
    email,
    role: input.role,
    updatedAt: new Date(),
  };

  if (input.password) {
    values.passwordHash = await hashPassword(input.password);
  }

  try {
    const [updated] = await db
      .update(adminUsers)
      .set(values)
      .where(eq(adminUsers.id, input.id))
      .returning();

    if (!updated) {
      return { status: "not_found" };
    }

    return { status: "updated", admin: toPublic(updated) };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { status: "email_taken" };
    }
    throw error;
  }
}

export async function deleteAdmin(id: string): Promise<boolean> {
  const removed = await db
    .delete(adminUsers)
    .where(eq(adminUsers.id, id))
    .returning({ id: adminUsers.id });
  return removed.length > 0;
}
