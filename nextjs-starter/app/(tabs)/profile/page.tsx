"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LogIn,
  LogOut,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { AuthSheet } from "@/components/auth/auth-sheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/lib/app/store";

export default function ProfilePage() {
  const { user, progressList, signOut } = useAppData();
  const [coverErrors, setCoverErrors] = useState<Record<string, boolean>>({});
  const [logoutOpen, setLogoutOpen] = useState(false);

  const totalLearned = progressList.reduce(
    (sum, item) => sum + item.progress.learnedCount,
    0
  );
  const studying = progressList.filter((item) => !item.progress.completed).length;
  const completed = progressList.filter((item) => item.progress.completed).length;

  return (
    <div>
      <header className="px-4 pb-4 pt-6">
        <h1 className="text-2xl font-bold">我的</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          查看学习进度与账号信息
        </p>
      </header>

      <main className="space-y-5 px-4">
        {user ? (
          <>
            <section className="flex items-center gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 to-card p-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {user.email.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.email}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  已登录 · 学习记录已同步
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                在线
              </span>
            </section>

            <section className="grid grid-cols-3 gap-2">
              {[
                {
                  icon: BookOpen,
                  label: "已学单词",
                  value: totalLearned,
                },
                { icon: Target, label: "学习中", value: studying },
                { icon: Trophy, label: "已完成", value: completed },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/70 bg-card px-2 py-3 text-center"
                >
                  <Icon className="mx-auto size-4 text-primary" />
                  <p className="mt-1.5 text-lg font-semibold tabular-nums">
                    {value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">学习进度</h2>
              </div>

              {progressList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-card px-4 py-8 text-center">
                  <GraduationCap className="mx-auto size-7 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">还没有学习记录</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    去首页挑一本单词书开始吧
                  </p>
                  <Button asChild className="mt-4 h-9 px-4 text-xs">
                    <Link href="/">去学习</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {progressList.map(({ book, progress }) => {
                    const total = book.wordCount || 1;
                    const percent = Math.min(
                      100,
                      Math.round((progress.learnedCount / total) * 100)
                    );

                    return (
                      <Link
                        key={book.id}
                        href={`/study/${book.bookld}`}
                        className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-transform active:scale-[0.99]"
                      >
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {book.coverUrl && !coverErrors[book.id] ? (
                            <Image
                              src={book.coverUrl}
                              alt={book.title}
                              fill
                              sizes="44px"
                              className="object-cover"
                              onError={() =>
                                setCoverErrors((prev) => ({
                                  ...prev,
                                  [book.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/20 text-sm font-semibold text-primary">
                              {book.title.slice(0, 1)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">
                              {book.title}
                            </p>
                            {progress.completed && (
                              <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600">
                                已完成
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            已学 {progress.learnedCount} / {total} 词
                          </p>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <Button
              variant="outline"
              className="h-11 w-full text-destructive hover:text-destructive"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="size-4" />
              退出登录
            </Button>
          </>
        ) : (
          <section className="rounded-2xl border border-border/70 bg-card px-5 py-10 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="size-6 text-primary" />
            </div>
            <h2 className="mt-4 text-base font-semibold">登录后同步学习进度</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              使用邮箱登录或注册，随时从上次学到的单词继续
            </p>
            <Button asChild className="mt-5 h-11 w-full text-base">
              <Link href="/profile?auth=1">登录 / 注册</Link>
            </Button>
          </section>
        )}
      </main>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-[320px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">退出登录？</DialogTitle>
            <DialogDescription className="text-xs">
              退出后学习进度仍保存在云端，下次登录可继续。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLogoutOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => {
                setLogoutOpen(false);
                await signOut();
              }}
            >
              确认退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <AuthSheet />
      </Suspense>
    </div>
  );
}
