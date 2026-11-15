"use client";

import {
  BookOpenText,
  CheckCircle2,
  Inbox,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Search,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import {
  BOOK_LEVELS,
  BOOK_LEVEL_LABELS,
  BOOK_STATUS_LABELS,
  type Book,
  type BookLevel,
} from "@/lib/types";

export function BooksView({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | BookLevel>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesLevel = level === "all" || book.level === level;
      const matchesKeyword =
        !keyword ||
        book.name.toLowerCase().includes(keyword) ||
        book.description.toLowerCase().includes(keyword);
      return matchesLevel && matchesKeyword;
    });
  }, [books, level, query]);

  const publishedCount = books.filter(
    (book) => book.status === "published"
  ).length;
  const totalWords = books.reduce((sum, book) => sum + book.wordCount, 0);

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
          hint="包含草稿与已发布"
          icon={<BookOpenText className="size-5" />}
        />
        <StatCard
          label="已发布"
          value={formatNumber(publishedCount)}
          hint={`草稿 ${books.length - publishedCount} 本`}
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="总词汇量"
          value={formatNumber(totalWords)}
          hint="所有单词书词汇量之和"
          icon={<Layers className="size-5" />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索单词书名称或简介"
              className="pl-9"
              aria-label="搜索单词书"
            />
          </div>

          <Select
            value={level}
            onValueChange={(value) => setLevel(value as "all" | BookLevel)}
          >
            <SelectTrigger className="w-full sm:w-36" aria-label="按级别筛选">
              <SelectValue placeholder="全部级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部级别</SelectItem>
              {BOOK_LEVELS.map((item) => (
                <SelectItem key={item} value={item}>
                  {BOOK_LEVEL_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <TableHead className="px-4">单词书</TableHead>
              <TableHead className="px-4">级别</TableHead>
              <TableHead className="px-4">词汇量</TableHead>
              <TableHead className="px-4">状态</TableHead>
              <TableHead className="px-4">更新时间</TableHead>
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
                      尝试调整搜索关键词或筛选条件
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="px-4 py-3">
                    <div className="max-w-[320px]">
                      <p className="font-medium">{book.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {book.description || "暂无简介"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="outline">
                      {BOOK_LEVEL_LABELS[book.level]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 tabular-nums">
                    {formatNumber(book.wordCount)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={
                        book.status === "published" ? "success" : "warning"
                      }
                    >
                      {BOOK_STATUS_LABELS[book.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {formatDate(book.updatedAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="编辑"
                        aria-label={`编辑 ${book.name}`}
                        onClick={() => openEdit(book)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title="删除"
                        aria-label={`删除 ${book.name}`}
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
          <span>数据保存在本地 JSON 文件中</span>
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
              确定要删除「{deleting?.name}」吗？删除后无法恢复。
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
