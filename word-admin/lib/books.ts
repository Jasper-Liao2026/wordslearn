import { randomUUID } from "node:crypto";

import { mutateCollection, readCollection } from "./db";
import type { Book, BookLevel, BookStatus } from "./types";

const FILE = "books.json";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

const SEED: Book[] = [
  {
    id: "cet4-core",
    name: "CET-4 核心词汇",
    description: "大学英语四级高频核心词汇，覆盖听力、阅读与写作常见场景。",
    level: "CET4",
    wordCount: 3739,
    status: "published",
    createdAt: daysAgo(96),
    updatedAt: daysAgo(2),
  },
  {
    id: "cet6-advanced",
    name: "CET-6 进阶词汇",
    description: "六级考试进阶词汇，侧重长难句与学术阅读中的高频表达。",
    level: "CET6",
    wordCount: 2265,
    status: "published",
    createdAt: daysAgo(74),
    updatedAt: daysAgo(6),
  },
  {
    id: "kaoyan-english",
    name: "考研英语真题词汇",
    description: "近十年考研英语真题中反复出现的核心词汇与熟词僻义。",
    level: "考研",
    wordCount: 5500,
    status: "draft",
    createdAt: daysAgo(41),
    updatedAt: daysAgo(1),
  },
  {
    id: "ielts-academic",
    name: "雅思学术词汇",
    description: "面向雅思阅读与写作的学术词汇，按学科主题分组编排。",
    level: "IELTS",
    wordCount: 3200,
    status: "published",
    createdAt: daysAgo(28),
    updatedAt: daysAgo(9),
  },
];

export async function listBooks(): Promise<Book[]> {
  const books = await readCollection<Book>(FILE, SEED);
  return [...books].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveBook(input: {
  id?: string;
  name: string;
  description: string;
  level: BookLevel;
  wordCount: number;
  status: BookStatus;
}): Promise<Book> {
  return mutateCollection<Book, Book>(FILE, SEED, (books) => {
    const now = new Date().toISOString();

    if (input.id) {
      const index = books.findIndex((book) => book.id === input.id);
      if (index === -1) {
        throw new Error("单词书不存在或已被删除");
      }

      const updated: Book = {
        ...books[index],
        name: input.name.trim(),
        description: input.description.trim(),
        level: input.level,
        wordCount: input.wordCount,
        status: input.status,
        updatedAt: now,
      };

      const next = [...books];
      next[index] = updated;
      return { items: next, result: updated };
    }

    const created: Book = {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description.trim(),
      level: input.level,
      wordCount: input.wordCount,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };

    return { items: [created, ...books], result: created };
  });
}

export async function deleteBook(id: string): Promise<boolean> {
  return mutateCollection<Book, boolean>(FILE, SEED, (books) => {
    const next = books.filter((book) => book.id !== id);
    return { items: next, result: next.length !== books.length };
  });
}
