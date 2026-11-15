import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { books } from "@/db/schema";
import type { Book } from "@/lib/app/types";
import { getWordTotals } from "@/lib/data/words";

function toBook(row: typeof books.$inferSelect, total?: number): Book {
  return {
    id: row.id,
    title: row.title,
    // 展示口径统一为 words 表中的实际条数
    wordCount: total ?? row.wordCount,
    coverUrl: row.coverUrl,
    bookld: row.bookld,
    tags: row.tags ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** 从 books 表读取全部单词书（H5 端只读） */
export async function getBooks(): Promise<Book[]> {
  try {
    const [rows, totals] = await Promise.all([
      db.select().from(books).orderBy(asc(books.title)),
      getWordTotals(),
    ]);

    return rows.map((row) => toBook(row, totals.get(row.bookld)));
  } catch (error) {
    console.error("读取 books 表失败", error);
    return [];
  }
}

export async function getBook(bookld: string): Promise<Book | null> {
  const [row] = await db
    .select()
    .from(books)
    .where(eq(books.bookld, bookld))
    .limit(1);

  if (!row) return null;

  const totals = await getWordTotals();
  return toBook(row, totals.get(row.bookld));
}
