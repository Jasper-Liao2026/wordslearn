export type AdminRole = "super_admin" | "admin";

export type AdminPublic = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
};

export type Book = {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookld: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "系统管理员",
  admin: "普通管理员",
};
