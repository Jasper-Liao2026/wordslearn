"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, LogIn } from "lucide-react";

import { BookCard } from "@/components/books/book-card";
import { RecentCard } from "@/components/books/recent-card";
import { useAppData } from "@/lib/app/store";

export default function HomePage() {
  const { user, recent, books } = useAppData();

  return (
    <div>
      <header className="flex items-start justify-between gap-3 px-4 pb-4 pt-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            WordsLearn
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-snug">
            今天也来记几个词
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {user
              ? `已登录 · ${user.email}`
              : "每天一点，把单词积累变成习惯"}
          </p>
        </div>

        {!user && (
          <Link
            href="/profile?auth=1"
            className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
          >
            <LogIn className="size-3.5" />
            登录
          </Link>
        )}
      </header>

      <main className="space-y-6 px-4">
        {user && recent && <RecentCard entry={recent} />}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">全部单词书</h2>
                {user ? (
                  <span className="text-xs text-muted-foreground">
                    共 {books.length} 本
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    点击单词书开始学习
                    <ChevronRight className="size-3" />
                  </span>
                )}
              </div>

              {books.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-card px-4 py-10 text-center">
                  <BookOpen className="mx-auto size-7 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">暂无单词书，敬请期待</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      loggedIn={Boolean(user)}
                    />
                  ))}
                </div>
              )}
            </section>

            {!user && (
              <p className="rounded-xl bg-muted/60 px-3 py-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                登录后可记录学习进度，下次打开自动从上次的单词继续
              </p>
            )}
      </main>
    </div>
  );
}
