"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Clock3, Sparkles } from "lucide-react";

import type { ProgressEntry } from "@/lib/app/types";

function formatRecentTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  const hm = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

  if (dayDiff === 0) return `今天 ${hm}`;
  if (dayDiff === 1) return `昨天 ${hm}`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function RecentCard({ entry }: { entry: ProgressEntry }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const { book, progress } = entry;
  const total = book.wordCount || 1;
  const percent = Math.min(100, Math.round((progress.learnedCount / total) * 100));

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <Sparkles className="size-4 text-primary" />
        最近学习
      </div>

      <Link
        href={`/study/${book.bookld}`}
        className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-transform active:scale-[0.99]"
      >
        <div className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          {book.coverUrl && !coverFailed ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              sizes="56px"
              className="object-cover"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 text-xl font-semibold text-primary-foreground">
              {book.title.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{book.title}</h3>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {progress.completed
              ? "已完成 · 可再次巩固"
              : `已学 ${progress.learnedCount} / ${total} 词 · ${percent}%`}
          </p>

          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock3 className="size-3" />
            最近：{formatRecentTime(progress.lastStudiedAt)}
          </p>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </Link>
    </section>
  );
}
