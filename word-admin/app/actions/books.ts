"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { deleteBook, saveBook } from "@/lib/books";

export type BookActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type BookInput = {
  id?: string;
  title: string;
  wordCount: number;
  coverUrl: string;
  bookld: string;
  tags: string[];
};

const BOOKLD_PATTERN = /^[A-Za-z0-9_-]+$/;

function validate(input: BookInput) {
  const fieldErrors: Record<string, string> = {};

  const title = input.title?.trim() ?? "";
  const bookld = input.bookld?.trim() ?? "";
  const coverUrl = input.coverUrl?.trim() ?? "";
  const wordCount = Number(input.wordCount);

  if (!title) {
    fieldErrors.title = "请输入标题";
  } else if (title.length > 60) {
    fieldErrors.title = "标题不能超过 60 个字符";
  }

  if (!bookld) {
    fieldErrors.bookld = "请输入 bookId";
  } else if (bookld.length > 64) {
    fieldErrors.bookld = "bookId 不能超过 64 个字符";
  } else if (!BOOKLD_PATTERN.test(bookld)) {
    fieldErrors.bookld = "bookId 只能包含字母、数字、下划线或短横线";
  }

  if (!Number.isInteger(wordCount) || wordCount < 0) {
    fieldErrors.wordCount = "单词数量需为不小于 0 的整数";
  } else if (wordCount > 100000) {
    fieldErrors.wordCount = "单词数量不能超过 100000";
  }

  if (coverUrl) {
    let valid = false;
    try {
      const url = new URL(coverUrl);
      valid = url.protocol === "http:" || url.protocol === "https:";
    } catch {
      valid = false;
    }
    if (!valid) {
      fieldErrors.coverUrl = "请输入合法的 http(s) 图片地址";
    }
  }

  const tags = Array.from(
    new Set(
      (Array.isArray(input.tags) ? input.tags : [])
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  if (tags.length > 10) {
    fieldErrors.tags = "标签最多 10 个";
  } else if (tags.some((tag) => tag.length > 20)) {
    fieldErrors.tags = "单个标签不能超过 20 个字符";
  }

  return {
    fieldErrors,
    values: {
      id: input.id,
      title,
      wordCount,
      coverUrl: coverUrl || null,
      bookld,
      tags,
    },
  };
}

export async function saveBookAction(
  input: BookInput
): Promise<BookActionResult> {
  await requireAdmin();

  const { fieldErrors, values } = validate(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "请检查表单内容", fieldErrors };
  }

  const result = await saveBook(values).catch(() => null);

  if (!result) {
    return { ok: false, error: "保存失败，请稍后重试" };
  }

  if (result.status === "bookld_taken") {
    return {
      ok: false,
      error: "请检查表单内容",
      fieldErrors: { bookld: "该 bookId 已被其他单词书使用" },
    };
  }

  if (result.status === "not_found") {
    return { ok: false, error: "单词书不存在或已被删除" };
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
