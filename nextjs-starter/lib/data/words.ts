import { and, asc, count, eq, gt } from "drizzle-orm";

import { db } from "@/db";
import { words } from "@/db/schema";
import type { Word } from "@/lib/app/types";

function toWord(row: typeof words.$inferSelect): Word {
  return {
    id: row.id,
    wordRand: row.wordRand ?? 0,
    headWord: row.headWord ?? "",
    content: row.content,
    bookld: row.bookld ?? "",
  };
}

export async function getWordCount(bookld: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(words)
    .where(eq(words.bookld, bookld));

  return row?.value ?? 0;
}

export async function getWordByRank(
  bookld: string,
  wordRand: number
): Promise<Word | null> {
  const [row] = await db
    .select()
    .from(words)
    .where(and(eq(words.bookld, bookld), eq(words.wordRand, wordRand)))
    .limit(1);

  return row ? toWord(row) : null;
}

/** 获取指定排名之后的下一个单词 */
export async function getNextWord(
  bookld: string,
  afterRank: number
): Promise<Word | null> {
  const [row] = await db
    .select()
    .from(words)
    .where(and(eq(words.bookld, bookld), gt(words.wordRand, afterRank)))
    .orderBy(asc(words.wordRand))
    .limit(1);

  return row ? toWord(row) : null;
}
