"use client";

/* eslint-disable @next/next/no-img-element */

import {
  BookOpenText,
  Inbox,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { deleteBookAction } from "@/app/actions/books";
import { BookFormDialog } from "@/components/books/book-form-dialog";
import { StatCard } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import type { Book } from "@/lib/types";

function BookCover({ src, title }: { src: string | null; title: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {src && !failed ? (
        <img
          src={src}
          alt={`${title} 封面`}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <BookOpenText className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}

export function BooksView({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return books;
    }
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(keyword) ||
        book.bookld.toLowerCase().includes(keyword) ||
        book.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  }, [books, query]);

  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);
  const totalTags = new Set(books.flatMap((book) => book.tags)).size;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setFormOpen(true);
  }

  function openDelete(book: Book) {
    setDeleteError(null);
    setDeleting(book);
  }

  function confirmDelete() {
    if (!deleting) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteBookAction(deleting.id);
      if (result.ok) {
        setDeleting(null);
        return;
      }
      setDeleteError(result.error);
    });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="单词书总数"
          value={formatNumber(books.length)}
          hint="管理端已录入的单词书"
          icon={<BookOpenText className="size-5" />}
        />
        <StatCard
          label="单词总量"
          value={formatNumber(totalWords)}
          hint="所有单词书单词数之和"
          icon={<Layers className="size-5" />}
        />
        <StatCard
          label="标签数量"
          value={formatNumber(totalTags)}
          hint="去重后的标签总数"
          icon={<Tags className="size-5" />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、bookId 或标签"
              className="pl-9"
              aria-label="搜索单词书"
            />
          </div>

          <div className="sm:ml-auto">
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus />
              新增单词书
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-4">封面</TableHead>
              <TableHead className="px-4">标题</TableHead>
              <TableHead className="px-4">单词数量</TableHead>
              <TableHead className="px-4">bookId</TableHead>
              <TableHead className="px-4">标签</TableHead>
              <TableHead className="px-4 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-16">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Inbox className="size-8 text-muted-foreground" />
                    <p className="text-sm font-medium">没有找到匹配的单词书</p>
                    <p className="text-xs text-muted-foreground">
                      {books.length === 0
                        ? "点击右上角「新增单词书」创建第一本单词书"
                        : "尝试调整搜索关键词"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="px-4 py-3">
                    <BookCover src={book.coverUrl} title={book.title} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="max-w-[260px] truncate font-medium">
                      {book.title}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 tabular-nums">
                    {formatNumber(book.wordCount)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {book.bookld}
                    </code>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {book.tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">-</span>
                    ) : (
                      <div className="flex max-w-[240px] flex-wrap gap-1">
                        {book.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="编辑"
                        aria-label={`编辑 ${book.title}`}
                        onClick={() => openEdit(book)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title="删除"
                        aria-label={`删除 ${book.title}`}
                        onClick={() => openDelete(book)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            共 {filtered.length} 本
            {filtered.length !== books.length
              ? `（总计 ${books.length} 本）`
              : ""}
          </span>
          <span>数据保存在 Supabase 数据库中</span>
        </div>
      </div>

      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editing}
      />

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除单词书</DialogTitle>
            <DialogDescription>
              确定要删除「{deleting?.title}」吗？删除后无法恢复，但不会影响
              words 表中已导入的单词数据。
            </DialogDescription>
          </DialogHeader>

          {deleteError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {deleteError}
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                取消
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={confirmDelete}
            >
              {pending ? <Loader2 className="animate-spin" /> : null}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
