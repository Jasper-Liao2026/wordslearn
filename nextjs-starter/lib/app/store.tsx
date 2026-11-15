"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { signOutAction } from "@/app/actions/auth";
import type {
  AppUser,
  Book,
  BookProgress,
  ProgressEntry,
  SaveProgressResult,
} from "@/lib/app/types";

type AppDataContextValue = {
  user: AppUser | null;
  books: Book[];
  progressList: ProgressEntry[];
  recent: ProgressEntry | null;
  getProgress: (bookld: string) => BookProgress | null;
  saveProgress: (bookld: string, wordRank: number) => Promise<SaveProgressResult>;
  resetProgress: (bookld: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function sortByRecent(entries: ProgressEntry[]) {
  return [...entries].sort(
    (a, b) =>
      new Date(b.progress.lastStudiedAt).getTime() -
      new Date(a.progress.lastStudiedAt).getTime()
  );
}

export function AppProvider({
  children,
  user,
  books,
  initialProgress,
}: {
  children: React.ReactNode;
  user: AppUser | null;
  books: Book[];
  initialProgress: ProgressEntry[];
}) {
  const router = useRouter();
  const [progressList, setProgressList] =
    useState<ProgressEntry[]>(initialProgress);

  useEffect(() => {
    setProgressList(initialProgress);
  }, [initialProgress]);

  const refreshProgress = useCallback(async () => {
    if (!user) {
      setProgressList([]);
      return;
    }

    const response = await fetch("/api/progress", { cache: "no-store" });
    if (!response.ok) return;

    const data = (await response.json()) as { progress: ProgressEntry[] };
    setProgressList(sortByRecent(data.progress));
  }, [user]);

  useEffect(() => {
    void refreshProgress();
  }, [refreshProgress]);

  const getProgress = useCallback(
    (bookld: string) =>
      progressList.find((entry) => entry.progress.bookld === bookld)?.progress ??
      null,
    [progressList]
  );

  const saveProgress = useCallback(
    async (bookld: string, wordRank: number) => {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookld, wordRank }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "保存学习进度失败");
      }

      const data = (await response.json()) as SaveProgressResult;
      const book = books.find((item) => item.bookld === bookld);

      setProgressList((prev) => {
        const rest = prev.filter((entry) => entry.progress.bookld !== bookld);
        return book
          ? sortByRecent([{ progress: data.progress, book }, ...rest])
          : rest;
      });

      return data;
    },
    [books]
  );

  const resetProgress = useCallback(async (bookld: string) => {
    const response = await fetch(
      `/api/progress?bookld=${encodeURIComponent(bookld)}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error("重置学习进度失败");
    }

    setProgressList((prev) =>
      prev.filter((entry) => entry.progress.bookld !== bookld)
    );
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    setProgressList([]);
    router.replace("/");
    router.refresh();
  }, [router]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      user,
      books,
      progressList,
      recent: progressList[0] ?? null,
      getProgress,
      saveProgress,
      resetProgress,
      refreshProgress,
      signOut,
    }),
    [
      user,
      books,
      progressList,
      getProgress,
      saveProgress,
      resetProgress,
      refreshProgress,
      signOut,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData 必须在 AppProvider 内使用");
  }
  return context;
}
