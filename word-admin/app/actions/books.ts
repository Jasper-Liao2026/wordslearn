"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { deleteBook, saveBook } from "@/lib/books";
import { BOOK_LEVELS, BOOK_STATUSES } from "@/lib/types";
import type { BookLevel, BookStatus } from "@/lib/types";

export type BookActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type BookInput = {
  id?: string;
  name: string;
  description: string;
  level: BookLevel;
  wordCount: number;
  status: BookStatus;
};

export async function saveBookAction(
  input: BookInput
): Promise<BookActionResult> {
  await requireAdmin();

  const fieldErrors: Record<string, string> = {};
  const name = input.name?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const wordCount = Number(input.wordCount);

  if (!name) {
    fieldErrors.name = "请输入单词书名称";
  } else if (name.length > 40) {
    fieldErrors.name = "名称不能超过 40 个字符";
  }

  if (!BOOK_LEVELS.includes(input.level)) {
    fieldErrors.level = "请选择有效的级别";
  }

  if (!Number.isInteger(wordCount) || wordCount < 0) {
    fieldErrors.wordCount = "词汇量需为不小于 0 的整数";
  } else if (wordCount > 100000) {
    fieldErrors.wordCount = "词汇量不能超过 100000";
  }

  if (!BOOK_STATUSES.includes(input.status)) {
    fieldErrors.status = "请选择有效的状态";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "请检查表单内容", fieldErrors };
  }

  try {
    await saveBook({
      id: input.id,
      name,
      description,
      level: input.level,
      wordCount,
      status: input.status,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "保存失败，请稍后重试",
    };
  }

  revalidatePath("/books");
  return { ok: true };
}

export async function deleteBookAction(id: string): Promise<BookActionResult> {
  await requireAdmin();

  if (!id) {
    return { ok: false, error: "缺少单词书 ID" };
  }

  const removed = await deleteBook(id);
  if (!removed) {
    return { ok: false, error: "单词书不存在或已被删除" };
  }

  revalidatePath("/books");
  return { ok: true };
}
