export type AdminRole = "super_admin" | "admin";

export type AdminPublic = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
};

export const BOOK_LEVELS = ["CET4", "CET6", "考研", "IELTS", "TOEFL", "其他"] as const;
export type BookLevel = (typeof BOOK_LEVELS)[number];

export const BOOK_STATUSES = ["published", "draft"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export type Book = {
  id: string;
  name: string;
  description: string;
  level: BookLevel;
  wordCount: number;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
};

export const BOOK_LEVEL_LABELS: Record<BookLevel, string> = {
  CET4: "CET-4",
  CET6: "CET-6",
  考研: "考研",
  IELTS: "雅思",
  TOEFL: "托福",
  其他: "其他",
};

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  published: "已发布",
  draft: "草稿",
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "系统管理员",
  admin: "普通管理员",
};
