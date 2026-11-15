import { asc } from "drizzle-orm";

import { db } from "@/db";
import { books } from "@/db/schema";
import type { Book } from "@/lib/app/types";

/** 从 books 表读取全部单词书（H5 端只读） */
export async function getBooks(): Promise<Book[]> {
  try {
    const rows = await db.select().from(books).orderBy(asc(books.title));

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      wordCount: row.wordCount,
      coverUrl: row.coverUrl,
      bookld: row.bookld,
      tags: row.tags ?? [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("读取 books 表失败", error);
    return [];
  }
}
