import type { Metadata } from "next";
import { Suspense } from "react";

import { BooksView } from "@/components/books/books-view";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth";
import { listBooks } from "@/lib/books";

export const metadata: Metadata = {
  title: "单词书管理 · WordsLearn 管理后台",
};

export default function BooksPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="单词书管理"
        description="维护单词书的封面、标题、单词数量与 bookId，并与 words 表数据关联。"
      />
      <Suspense fallback={<BooksSkeleton />}>
        <BooksSection />
      </Suspense>
    </div>
  );
}

async function BooksSection() {
  await requireAdmin();
  const books = await listBooks();
  return <BooksView books={books} />;
}

function BooksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  );
}
