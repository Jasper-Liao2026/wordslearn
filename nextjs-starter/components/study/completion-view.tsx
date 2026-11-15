"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CompletionView({
  bookTitle,
  learned,
  total,
  onRestart,
  onBack,
}: {
  bookTitle: string;
  learned: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col items-center justify-center px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="size-8 text-emerald-600" />
      </div>

      <h1 className="mt-5 text-xl font-semibold">本书已学完</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{bookTitle}</p>

      <div className="mt-6 flex w-full max-w-[260px] items-center justify-center gap-6 rounded-2xl border border-border/70 bg-card px-4 py-4">
        <div>
          <p className="text-xl font-semibold tabular-nums">{learned}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">已学单词</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-xl font-semibold tabular-nums">{total}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">本册词数</p>
        </div>
      </div>

      <div className="mt-7 w-full max-w-[260px] space-y-2">
        <Button className="h-11 w-full" onClick={onRestart}>
          <RotateCcw className="size-4" />
          再学一遍
        </Button>
        <Button variant="ghost" className="h-11 w-full" onClick={onBack}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
