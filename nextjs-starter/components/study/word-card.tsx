"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Word } from "@/lib/app/types";
import type { WordCardData } from "@/lib/word-content";

export function WordCard({
  bookld,
  word,
  data,
}: {
  bookld: string;
  word: Word;
  data: WordCardData;
}) {
  return (
    <Link
      href={`/study/${bookld}/word/${word.wordRand}`}
      className="block rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-transform active:scale-[0.99]"
    >
      <div className="flex min-h-[340px] flex-col">
        <p className="text-center text-[11px] text-muted-foreground">
          点击卡片查看完整释义
        </p>

        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <h1 className="break-all text-[42px] font-bold leading-tight tracking-tight">
            {data.headWord}
          </h1>

          {data.phone && (
            <p className="mt-2 text-sm text-muted-foreground">{data.phone}</p>
          )}

          <div className="my-5 h-px w-12 bg-border" />

          <p className="text-xl font-medium leading-relaxed">{data.tranCn}</p>
        </div>

        {data.sentence && (
          <div className="rounded-2xl bg-muted/60 px-4 py-3 text-left">
            <p className="text-sm leading-relaxed">{data.sentence.sContent}</p>
            {data.sentence.sCn && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {data.sentence.sCn}
              </p>
            )}
          </div>
        )}

        <p className="mt-3 flex items-center justify-center gap-0.5 text-[11px] text-primary">
          查看详情
          <ChevronRight className="size-3" />
        </p>
      </div>
    </Link>
  );
}
