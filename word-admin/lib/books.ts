import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { books } from "@/db/schema";
import type { Book } from "./types";

type BookRecord = typeof books.$inferSelect;

function toBook(book: BookRecord): Book {
  return {
    id: book.id,
    title: book.title,
    wordCount: book.wordCount,
    coverUrl: book.coverUrl,
    bookld: book.bookld,
    tags: book.tags,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
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

export async function listBooks(): Promise<Book[]> {
  const rows = await db.select().from(books).orderBy(desc(books.updatedAt));
  return rows.map(toBook);
}

export type SaveBookInput = {
  id?: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookld: string;
  tags: string[];
};

export type SaveBookResult =
  | { status: "created" | "updated"; book: Book }
  | { status: "bookld_taken" }
  | { status: "not_found" };

export async function saveBook(input: SaveBookInput): Promise<SaveBookResult> {
  const values = {
    title: input.title.trim(),
    wordCount: input.wordCount,
    coverUrl: input.coverUrl,
    bookld: input.bookld.trim(),
    tags: input.tags,
    updatedAt: new Date(),
  };

  try {
    if (input.id) {
      const [updated] = await db
        .update(books)
        .set(values)
        .where(eq(books.id, input.id))
        .returning();

      if (!updated) {
        return { status: "not_found" };
      }

      return { status: "updated", book: toBook(updated) };
    }

    const [created] = await db.insert(books).values(values).returning();
    return { status: "created", book: toBook(created) };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { status: "bookld_taken" };
    }
    throw error;
  }
}

export async function deleteBook(id: string): Promise<boolean> {
  const removed = await db
    .delete(books)
    .where(eq(books.id, id))
    .returning({ id: books.id });
  return removed.length > 0;
}
