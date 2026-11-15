"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { saveBookAction } from "@/app/actions/books";
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
import { Label } from "@/components/ui/label";
import type { Book } from "@/lib/types";

export function BookFormDialog({
  open,
  onOpenChange,
  book,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BookFormContent
          key={book?.id ?? "new"}
          book={book}
          onDone={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}

function BookFormContent({
  book,
  onDone,
}: {
  book: Book | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState(() =>
    book
      ? {
          title: book.title,
          wordCount: String(book.wordCount),
          coverUrl: book.coverUrl ?? "",
          bookld: book.bookld,
          tags: book.tags.join(", "),
        }
      : {
          title: "",
          wordCount: "",
          coverUrl: "",
          bookld: "",
          tags: "",
        }
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const tags = form.tags
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await saveBookAction({
        id: book?.id,
        title: form.title,
        wordCount: Number(form.wordCount),
        coverUrl: form.coverUrl,
        bookld: form.bookld,
        tags,
      });

      if (result.ok) {
        onDone();
        return;
      }

      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
    });
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{book ? "编辑单词书" : "新增单词书"}</DialogTitle>
        <DialogDescription>
          {book
            ? "修改单词书信息，保存后立即生效。"
            : "填写单词书信息，bookId 需与单词数据中的 bookld 对应。"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="book-title">标题</Label>
          <Input
            id="book-title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="例如：CET-4 核心词汇"
            aria-invalid={Boolean(fieldErrors.title)}
            required
          />
          {fieldErrors.title ? (
            <p className="text-xs text-destructive">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="book-word-count">单词数量</Label>
            <Input
              id="book-word-count"
              type="number"
              min={0}
              max={100000}
              value={form.wordCount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  wordCount: event.target.value,
                }))
              }
              placeholder="0"
              aria-invalid={Boolean(fieldErrors.wordCount)}
              required
            />
            {fieldErrors.wordCount ? (
              <p className="text-xs text-destructive">
                {fieldErrors.wordCount}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-bookld">bookId</Label>
            <Input
              id="book-bookld"
              value={form.bookld}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bookld: event.target.value,
                }))
              }
              placeholder="例如：CET4luan_2"
              aria-invalid={Boolean(fieldErrors.bookld)}
              required
            />
            {fieldErrors.bookld ? (
              <p className="text-xs text-destructive">{fieldErrors.bookld}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-cover-url">封面 URL</Label>
          <Input
            id="book-cover-url"
            type="url"
            value={form.coverUrl}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                coverUrl: event.target.value,
              }))
            }
            placeholder="https://example.com/cover.jpg"
            aria-invalid={Boolean(fieldErrors.coverUrl)}
          />
          {fieldErrors.coverUrl ? (
            <p className="text-xs text-destructive">{fieldErrors.coverUrl}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-tags">标签</Label>
          <Input
            id="book-tags"
            value={form.tags}
            onChange={(event) =>
              setForm((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="四级, 核心, 高频"
            aria-invalid={Boolean(fieldErrors.tags)}
          />
          {fieldErrors.tags ? (
            <p className="text-xs text-destructive">{fieldErrors.tags}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              多个标签用逗号分隔，最多 10 个
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              取消
            </Button>
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {book ? "保存修改" : "创建单词书"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
