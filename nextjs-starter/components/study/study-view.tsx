"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useToast } from "@/lib/app/toast";
import type { BookProgress, Word } from "@/lib/app/types";
import { parseWordCard } from "@/lib/word-content";

type StudyState = {
  progress: BookProgress | null;
  total: number;
  word: Word | null;
  position: number;
  completed: boolean;
};

/** 本地单词窗口大小：切词无需等待网络 */
const WINDOW_SIZE = 8;
/** 窗口剩余不足该值时预取下一批 */
const PREFETCH_THRESHOLD = 3;

export function StudyView({ bookld }: { bookld: string }) {
  const router = useRouter();
  const { user, books, saveProgress, resetProgress } = useAppData();
  const { show } = useToast();

  const book = useMemo(
    () => books.find((item) => item.bookld === bookld) ?? null,
    [books, bookld]
  );

  const [queue, setQueue] = useState<Word[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [position, setPosition] = useState(0);
  const [learned, setLearned] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [restartOpen, setRestartOpen] = useState(false);
  const prefetchingRef = useRef(false);

  const redirectToLogin = useCallback(
    (expired: boolean) => {
      const query = new URLSearchParams({
        auth: "1",
        next: `/study/${bookld}`,
      });
      if (expired) query.set("reason", "expired");
      router.replace(`/profile?${query.toString()}`);
    },
    [bookld, router]
  );

  const fetchBatch = useCallback(
    async (afterRank: number, limit: number): Promise<Word[]> => {
      const response = await fetch(
        `/api/books/${bookld}/words?after=${afterRank}&limit=${limit}`,
        { cache: "no-store" }
      );

      if (response.status === 401) {
        redirectToLogin(true);
        return [];
      }
      if (!response.ok) {
        throw new Error("获取单词失败");
      }

      const data = (await response.json()) as { words: Word[] };
      return data.words;
    },
    [bookld, redirectToLogin]
  );

  const loadStudy = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const response = await fetch(`/api/books/${bookld}/study`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        redirectToLogin(true);
        return;
      }
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      if (!response.ok) {
        throw new Error("加载学习进度失败");
      }

      const data = (await response.json()) as StudyState;
      setTotal(data.total);
      setPosition(data.position);
      setLearned(data.progress?.learnedCount ?? 0);

      if (data.completed || !data.word) {
        setQueue([]);
        setHasMore(false);
        setFinished(true);
        return;
      }

      setFinished(false);
      setQueue([data.word]);

      try {
        const batch = await fetchBatch(data.word.wordRand, WINDOW_SIZE - 1);
        setQueue([data.word, ...batch]);
        setHasMore(batch.length === WINDOW_SIZE - 1);
      } catch {
        setHasMore(false);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [bookld, fetchBatch, redirectToLogin]);

  useEffect(() => {
    if (!user) {
      redirectToLogin(false);
      return;
    }
    void loadStudy();
  }, [user, loadStudy, redirectToLogin]);

  const prefetchTail = useCallback(
    async (afterRank: number) => {
      if (prefetchingRef.current) return;
      prefetchingRef.current = true;

      try {
        const batch = await fetchBatch(afterRank, WINDOW_SIZE);
        setHasMore(batch.length === WINDOW_SIZE);
        setQueue((prev) => {
          const existing = new Set(prev.map((item) => item.wordRand));
          return [...prev, ...batch.filter((item) => !existing.has(item.wordRand))];
        });
      } catch {
        // 预取失败不打断当前学习，点击下一个时会再次尝试
      } finally {
        prefetchingRef.current = false;
      }
    },
    [fetchBatch]
  );

  const handleNext = async () => {
    const current = queue[0];
    if (!current || saving) return;

    const rest = queue.slice(1);
    setQueue(rest);
    setPosition((value) => Math.min(value + 1, total));
    setSaving(true);

    // 进度异步写入：失败只提示，不阻断切换，下次点击会重试
    const persistence = saveProgress(bookld, current.wordRand)
      .then((result) => {
        setLearned(result.progress.learnedCount);
        setTotal(result.total);
      })
      .catch(() => {
        show("进度保存失败，请检查网络后重试", "error");
      });

    if (rest.length === 0) {
      if (!hasMore) {
        setFinished(true);
      } else {
        try {
          const batch = await fetchBatch(current.wordRand, WINDOW_SIZE);
          setQueue(batch);
          setHasMore(batch.length === WINDOW_SIZE);
          if (batch.length === 0) setFinished(true);
        } catch {
          setFinished(true);
        }
      }
    } else if (rest.length <= PREFETCH_THRESHOLD && hasMore) {
      void prefetchTail(rest[rest.length - 1].wordRand);
    }

    await persistence;
    setSaving(false);
  };

  const handleRestart = async () => {
    setRestartOpen(false);

    try {
      await resetProgress(bookld);
      setFinished(false);
      await loadStudy();
    } catch {
      show("重置进度失败，请稍后重试", "error");
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

  if (notFound) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-base font-semibold">单词书不存在</p>
        <p className="text-xs text-muted-foreground">
          该单词书可能已被移除，换个单词书试试吧
        </p>
        <Button variant="outline" onClick={() => router.replace("/")}>
          返回首页
        </Button>
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

  const word = queue[0];
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
