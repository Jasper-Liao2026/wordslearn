import type { Metadata, Viewport } from "next";
import { connection } from "next/server";

import { AppProvider } from "@/lib/app/store";
import { getCurrentUser } from "@/lib/auth/session";
import { getBooks } from "@/lib/data/books";
import { getProgressList } from "@/lib/data/progress";

import "./globals.css";

export const metadata: Metadata = {
  title: "WordsLearn · 每天记一点",
  description: "轻量英语单词学习 H5",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f7f8",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 用户会话与单词书均来自数据库，每次请求读取最新数据
  await connection();

  const user = await getCurrentUser();
  const [books, progress] = await Promise.all([
    getBooks(),
    user ? getProgressList(user.id) : Promise.resolve([]),
  ]);

  return (
    <html lang="zh-CN">
      <body>
        <AppProvider user={user} books={books} initialProgress={progress}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
