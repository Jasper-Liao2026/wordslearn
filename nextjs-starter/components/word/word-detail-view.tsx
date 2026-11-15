"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/lib/app/store";
import type { Word } from "@/lib/app/types";
import { parseWordDetail } from "@/lib/word-content";

export function WordDetailView({
  bookld,
  wordRank,
}: {
  bookld: string;
  wordRank: number;
}) {
  const router = useRouter();
  const { user, books } = useAppData();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<"uk" | "us" | null>(null);
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const book = useMemo(
    () => books.find((item) => item.bookld === bookld) ?? null,
    [books, bookld]
  );
  const detail = useMemo(() => (word ? parseWordDetail(word) : null), [word]);

  const loadWord = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/books/${bookld}/words/${wordRank}`, {
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace(
          `/profile?auth=1&next=${encodeURIComponent(
            `/study/${bookld}/word/${wordRank}`
          )}`
        );
        return;
      }
      if (!response.ok) {
        throw new Error("单词不存在");
      }

      const data = (await response.json()) as { word: Word };
      setWord(data.word);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [bookld, wordRank, router]);

  useEffect(() => {
    if (!user) {
      router.replace(
        `/profile?auth=1&next=${encodeURIComponent(
          `/study/${bookld}/word/${wordRank}`
        )}`
      );
      return;
    }
    void loadWord();
  }, [user, bookld, wordRank, loadWord, router]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakFallback = (text: string, accent: "uk" | "us") => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent === "uk" ? "en-GB" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const play = (accent: "uk" | "us") => {
    if (!detail?.headWord) return;

    audioRef.current?.pause();
    window.speechSynthesis?.cancel();

    const audio = new Audio(
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
        detail.headWord
      )}&type=${accent === "uk" ? 1 : 2}`
    );
    audioRef.current = audio;
    setPlaying(accent);

    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      setPlaying(null);
      speakFallback(detail.headWord, accent);
    };
    void audio.play().catch(() => {
      setPlaying(null);
      speakFallback(detail.headWord, accent);
    });
  };

  if (!user) {
    return (
      <div className="mx-auto min-h-dvh max-w-[480px] space-y-4 bg-background px-4 pt-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-24 w-2/3 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <p className="text-center text-xs text-muted-foreground">正在跳转登录…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto min-h-dvh max-w-[480px] space-y-4 bg-background px-4 pt-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-24 w-2/3 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          正在获取单词详情…
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium text-destructive">{error || "单词不存在"}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.replace(`/study/${bookld}`)}>
            返回学习
          </Button>
          <Button onClick={() => void loadWord()}>重试</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-10">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur">
          <button
            type="button"
            onClick={() => router.push(`/study/${bookld}`)}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="返回学习页"
          >
            <ArrowLeft className="size-5" />
          </button>
          <p className="truncate text-sm font-medium">{book?.title ?? "单词详情"}</p>
        </header>

        <main className="space-y-6 px-4 pt-5">
          <section>
            <h1 className="break-all text-[36px] font-bold leading-tight tracking-tight">
              {detail.headWord}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <PhoneticButton
                label="英"
                phone={detail.ukphone ? `/${detail.ukphone}/` : "英式发音"}
                playing={playing === "uk"}
                onClick={() => play("uk")}
              />
              <PhoneticButton
                label="美"
                phone={detail.usphone ? `/${detail.usphone}/` : "美式发音"}
                playing={playing === "us"}
                onClick={() => play("us")}
              />
            </div>
          </section>

          {detail.trans.length > 0 && (
            <Section title="释义">
              <ul className="space-y-2">
                {detail.trans.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm leading-relaxed">
                    {item.pos && (
                      <span className="shrink-0 italic text-primary">{item.pos}</span>
                    )}
                    <span>{item.tranCn}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {detail.sentences.length > 0 && (
            <Section title="例句">
              <ul className="space-y-3">
                {detail.sentences.map((item, index) => (
                  <li key={index}>
                    <p className="text-sm leading-relaxed">{item.sContent}</p>
                    {item.sCn && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.sCn}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {detail.phrases.length > 0 && (
            <Section title="短语">
              <ul className="space-y-2">
                {detail.phrases.map((item, index) => (
                  <li
                    key={index}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm"
                  >
                    <span className="font-medium">{item.pContent}</span>
                    {item.pCn && (
                      <span className="text-xs text-muted-foreground">{item.pCn}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {detail.synos.length > 0 && (
            <Section title="同近义词">
              <ul className="space-y-2.5">
                {detail.synos.map((item, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    <span className="text-xs text-muted-foreground">
                      {[item.pos, item.tran].filter(Boolean).join(" ")}
                    </span>
                    <p className="mt-0.5">{item.words.join(" / ")}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {detail.relWords.length > 0 && (
            <Section title="同根词">
              <ul className="space-y-2.5">
                {detail.relWords.map((group, index) => (
                  <li key={index} className="space-y-1">
                    {group.pos && (
                      <p className="text-xs text-muted-foreground">{group.pos}</p>
                    )}
                    {group.items.map((item) => (
                      <p
                        key={`${group.pos}-${item.hwd}`}
                        className="text-sm leading-relaxed"
                      >
                        <span className="font-medium">{item.hwd}</span>
                        {item.tran && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.tran}
                          </span>
                        )}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}

function PhoneticButton({
  label,
  phone,
  playing,
  onClick,
}: {
  label: string;
  phone: string;
  playing: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-sm text-muted-foreground transition-colors active:bg-muted"
      aria-label={`播放${label}式发音`}
    >
      <span className="text-[10px] font-medium text-primary">{label}</span>
      <span>{phone}</span>
      <Volume2 className={playing ? "size-4 animate-pulse text-primary" : "size-4"} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
