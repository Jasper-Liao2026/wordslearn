import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** 现有：单词书（由管理后台维护，H5 只读） */
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  coverUrl: text("cover_url"),
  bookld: text("bookld").notNull().unique(),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 现有：单词（content 保存 {"word": {...}} 结构） */
export const words = pgTable(
  "words",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedByDefaultAsIdentity(),
    wordRand: integer("wordRand"),
    headWord: text("headWord"),
    content: json("content"),
    bookld: text("bookld"),
  },
  (table) => [index("words_bookld_wordrand_idx").on(table.bookld, table.wordRand)]
);

/** 新增：C 端用户 */
export const appUsers = pgTable("app_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 新增：用户会话（数据库只保存 token 的 SHA-256） */
export const appSessions = pgTable(
  "app_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("app_sessions_user_id_idx").on(table.userId),
    index("app_sessions_expires_at_idx").on(table.expiresAt),
  ]
);

/** 新增：学习进度 */
export const learningProgress = pgTable(
  "learning_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    bookld: text("bookld")
      .notNull()
      .references(() => books.bookld, { onDelete: "cascade" }),
    lastWordRank: integer("last_word_rank").notNull().default(0),
    learnedCount: integer("learned_count").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    lastStudiedAt: timestamp("last_studied_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("learning_progress_user_book_unique").on(table.userId, table.bookld),
    index("learning_progress_user_recent_idx").on(
      table.userId,
      table.lastStudiedAt
    ),
  ]
);

export const booksRelations = relations(books, ({ many }) => ({
  words: many(words),
  progress: many(learningProgress),
}));

export const wordsRelations = relations(words, ({ one }) => ({
  book: one(books, {
    fields: [words.bookld],
    references: [books.bookld],
  }),
}));

export const appUsersRelations = relations(appUsers, ({ many }) => ({
  sessions: many(appSessions),
  progress: many(learningProgress),
}));

export const appSessionsRelations = relations(appSessions, ({ one }) => ({
  user: one(appUsers, {
    fields: [appSessions.userId],
    references: [appUsers.id],
  }),
}));

export const learningProgressRelations = relations(
  learningProgress,
  ({ one }) => ({
    user: one(appUsers, {
      fields: [learningProgress.userId],
      references: [appUsers.id],
    }),
    book: one(books, {
      fields: [learningProgress.bookld],
      references: [books.bookld],
    }),
  })
);

export type BookRow = typeof books.$inferSelect;
export type WordRow = typeof words.$inferSelect;
export type AppUserRow = typeof appUsers.$inferSelect;
export type AppSessionRow = typeof appSessions.$inferSelect;
export type LearningProgressRow = typeof learningProgress.$inferSelect;
