"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { CompletionView } from "@/components/study/completion-view";
import { WordCard } from "@/components/study/word-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/lib/app/store";
import type { BookProgress, Word } from "@/lib/app/types";
import { parseWordCard } from "@/lib/word-content";

type StudyState = {
  progress: BookProgress | null;
  total: number;
  word: Word | null;
  position: number;
  completed: boolean;
};

export function StudyView({ bookld }: { bookld: string }) {
  const router = useRouter();
  const { user, books, saveProgress, resetProgress } = useAppData();

  const book = useMemo(
    () => books.find((item) => item.bookld === bookld) ?? null,
    [books, bookld]
  );

  const [word, setWord] = useState<Word | null>(null);
  const [total, setTotal] = useState(0);
  const [position, setPosition] = useState(0);
  const [learned, setLearned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [restartOpen, setRestartOpen] = useState(false);

  const loadStudy = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/books/${bookld}/study`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace(
          `/profile?auth=1&next=${encodeURIComponent(`/study/${bookld}`)}`
        );
        return;
      }
      if (!response.ok) {
        throw new Error("加载学习进度失败");
      }

      const data = (await response.json()) as StudyState;
      setTotal(data.total);
      setPosition(data.position);
      setLearned(data.progress?.learnedCount ?? 0);
      setWord(data.word);
      setFinished(data.completed || !data.word);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [bookld, router]);

  useEffect(() => {
    if (!user) {
      router.replace(
        `/profile?auth=1&next=${encodeURIComponent(`/study/${bookld}`)}`
      );
      return;
    }
    void loadStudy();
  }, [user, bookld, loadStudy, router]);

  const handleNext = async () => {
    if (!word || saving) return;

    setSaving(true);
    setError("");

    try {
      const result = await saveProgress(bookld, word.wordRand);
      setTotal(result.total);
      setLearned(result.progress.learnedCount);

      if (result.nextWord) {
        setWord(result.nextWord);
        setPosition(Math.min(result.progress.learnedCount + 1, result.total));
      } else {
        setWord(null);
        setFinished(true);
        setPosition(result.total);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存进度失败");
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = async () => {
    setRestartOpen(false);
    setFinished(false);

    try {
      await resetProgress(bookld);
      await loadStudy();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "重置进度失败");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto min-h-dvh max-w-[480px] space-y-4 bg-background px-4 pt-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
        <p className="text-center text-xs text-muted-foreground">正在跳转登录…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto min-h-dvh max-w-[480px] space-y-4 bg-background px-4 pt-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          正在获取单词…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.replace("/")}>
            返回首页
          </Button>
          <Button onClick={() => void loadStudy()}>重试</Button>
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium">该单词书暂无单词</p>
        <Button variant="outline" onClick={() => router.replace("/")}>
          返回首页
        </Button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-dvh bg-muted/30">
        <div className="mx-auto min-h-dvh max-w-[480px] bg-background">
          <header className="flex h-14 items-center border-b border-border/60 px-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              aria-label="返回首页"
            >
              <ArrowLeft className="size-5" />
            </button>
            <p className="ml-1 truncate text-sm font-medium">
              {book?.title ?? "单词学习"}
            </p>
          </header>

          <CompletionView
            bookTitle={book?.title ?? "单词学习"}
            learned={learned}
            total={total}
            onRestart={() => setRestartOpen(true)}
            onBack={() => router.push("/")}
          />

          <Dialog open={restartOpen} onOpenChange={setRestartOpen}>
            <DialogContent className="max-w-[320px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base">再学一遍？</DialogTitle>
                <DialogDescription className="text-xs">
                  学习进度将清零，并从第一个单词重新开始。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRestartOpen(false)}
                >
                  取消
                </Button>
                <Button className="flex-1" onClick={() => void handleRestart()}>
                  确认重置
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (!word) {
    return null;
  }

  const progressPercent =
    total > 0 ? Math.min(100, Math.round((learned / total) * 100)) : 0;
  const isLast = position >= total;

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-background">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 pt-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
              aria-label="返回首页"
            >
              <ArrowLeft className="size-5" />
            </button>

            <div className="min-w-0 text-center">
              <p className="truncate text-xs font-medium">
                {book?.title ?? "单词学习"}
              </p>
              <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                第 {position} / {total} 个
              </p>
            </div>

            <div className="size-9" />
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        <main className="flex flex-1 flex-col px-4 pb-28 pt-4">
          <WordCard bookld={bookld} word={word} data={parseWordCard(word)} />
        </main>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-border/60 bg-background/95 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <Button
            className="h-12 w-full text-base"
            onClick={() => void handleNext()}
            disabled={saving}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {isLast ? "完成学习" : "下一个"}
          </Button>
        </div>
      </div>
    </div>
  );
}
