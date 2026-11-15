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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BOOK_LEVELS,
  BOOK_LEVEL_LABELS,
  BOOK_STATUSES,
  BOOK_STATUS_LABELS,
  type Book,
  type BookLevel,
  type BookStatus,
} from "@/lib/types";

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
          name: book.name,
          description: book.description,
          level: book.level,
          wordCount: String(book.wordCount),
          status: book.status,
        }
      : {
          name: "",
          description: "",
          level: "CET4" as BookLevel,
          wordCount: "",
          status: "draft" as BookStatus,
        }
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await saveBookAction({
        id: book?.id,
        name: form.name,
        description: form.description,
        level: form.level,
        wordCount: Number(form.wordCount),
        status: form.status,
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
            ? "修改单词书的基础信息，保存后立即生效。"
            : "填写单词书信息，创建后可继续编辑。"}
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
          <Label htmlFor="book-name">名称</Label>
          <Input
            id="book-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="例如：CET-4 核心词汇"
            aria-invalid={Boolean(fieldErrors.name)}
            required
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>级别</Label>
            <Select
              value={form.level}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  level: value as BookLevel,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择级别" />
              </SelectTrigger>
              <SelectContent>
                {BOOK_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {BOOK_LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.level ? (
              <p className="text-xs text-destructive">{fieldErrors.level}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-word-count">词汇量</Label>
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
            <Label>状态</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as BookStatus,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                {BOOK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {BOOK_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.status ? (
              <p className="text-xs text-destructive">{fieldErrors.status}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-description">简介</Label>
          <Textarea
            id="book-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="简要说明单词书的适用人群与内容范围"
            rows={3}
          />
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
