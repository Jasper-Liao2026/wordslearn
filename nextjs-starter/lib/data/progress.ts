import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { books, userBookProgress, userWordProgress } from "@/db/schema";
import type { Book, BookProgress, ProgressEntry, SaveProgressResult } from "@/lib/app/types";
import { getNextWord, getWordCount } from "@/lib/data/words";

function toProgress(row: typeof userBookProgress.$inferSelect): BookProgress {
  return {
    id: row.id,
    userId: row.userId,
    bookld: row.bookld,
    lastWordRank: row.lastWordRank,
    learnedCount: row.learnedCount,
    completed: row.completed,
    lastStudiedAt: row.lastStudiedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toBook(row: typeof books.$inferSelect): Book {
  return {
    id: row.id,
    title: row.title,
    wordCount: row.wordCount,
    coverUrl: row.coverUrl,
    bookld: row.bookld,
    tags: row.tags ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function countLearned(userId: string, bookld: string) {
  return db
    .select({ value: count() })
    .from(userWordProgress)
    .where(
      and(eq(userWordProgress.userId, userId), eq(userWordProgress.bookld, bookld))
    );
}

/** 我的页面 / 首页最近学习：按最近学习时间倒序 */
export async function getProgressList(userId: string): Promise<ProgressEntry[]> {
  const rows = await db
    .select({ progress: userBookProgress, book: books })
    .from(userBookProgress)
    .innerJoin(books, eq(userBookProgress.bookld, books.bookld))
    .where(eq(userBookProgress.userId, userId))
    .orderBy(desc(userBookProgress.lastStudiedAt));

  return rows.map(({ progress, book }) => ({
    progress: toProgress(progress),
    book: toBook(book),
  }));
}

export async function getBookProgress(
  userId: string,
  bookld: string
): Promise<BookProgress | null> {
  const [row] = await db
    .select()
    .from(userBookProgress)
    .where(
      and(eq(userBookProgress.userId, userId), eq(userBookProgress.bookld, bookld))
    )
    .limit(1);

  return row ? toProgress(row) : null;
}

/** 标记一个单词已学，并同步 book / word 两张进度表 */
export async function saveWordProgress(input: {
  userId: string;
  bookld: string;
  wordRank: number;
}): Promise<SaveProgressResult> {
  const { userId, bookld, wordRank } = input;

  await db
    .insert(userWordProgress)
    .values({ userId, bookld, wordRank })
    .onConflictDoNothing();

  const [counted] = await countLearned(userId, bookld);
  const learnedCount = counted?.value ?? 0;
  const nextWord = await getNextWord(bookld, wordRank);
  const completed = !nextWord;
  const total = await getWordCount(bookld);
  const now = new Date();

  const [row] = await db
    .insert(userBookProgress)
    .values({
      userId,
      bookld,
      lastWordRank: wordRank,
      learnedCount,
      completed,
      lastStudiedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userBookProgress.userId, userBookProgress.bookld],
      set: {
        lastWordRank: sql`greatest(${userBookProgress.lastWordRank}, ${wordRank})`,
        learnedCount,
        completed,
        lastStudiedAt: now,
        updatedAt: now,
      },
    })
    .returning();

  return {
    progress: toProgress(row),
    nextWord,
    total,
  };
}

export async function resetBookProgress(userId: string, bookld: string) {
  await db
    .delete(userWordProgress)
    .where(
      and(eq(userWordProgress.userId, userId), eq(userWordProgress.bookld, bookld))
    );
  await db
    .delete(userBookProgress)
    .where(
      and(eq(userBookProgress.userId, userId), eq(userBookProgress.bookld, bookld))
    );
}

/** 学习页初始化：根据进度返回下一个单词 */
export async function getStudyState(userId: string, bookld: string) {
  const [progress, total] = await Promise.all([
    getBookProgress(userId, bookld),
    getWordCount(bookld),
  ]);

  if (total === 0) {
    return { progress, total, word: null, position: 0, completed: true };
  }

  if (progress?.completed) {
    return { progress, total, word: null, position: total, completed: true };
  }

  const word = await getNextWord(bookld, progress?.lastWordRank ?? 0);
  if (!word) {
    return { progress, total, word: null, position: total, completed: true };
  }

  return {
    progress,
    total,
    word,
    position: Math.min((progress?.learnedCount ?? 0) + 1, total),
    completed: false,
  };
}
