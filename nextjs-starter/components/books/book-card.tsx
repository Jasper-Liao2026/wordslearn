"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BookOpen } from "lucide-react";

import type { Book } from "@/lib/app/types";

type BookCardProps = {
  book: Book;
  loggedIn: boolean;
};

export function BookCard({ book, loggedIn }: BookCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const href = loggedIn
    ? `/study/${book.bookld}`
    : `/profile?auth=1&next=/study/${book.bookld}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {book.coverUrl && !coverFailed ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 480px) 45vw, 220px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 text-4xl font-semibold text-primary-foreground">
            {book.title.slice(0, 1)}
          </div>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{book.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="size-3.5" />
          <span>{book.wordCount.toLocaleString()} 词</span>
        </div>
        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
