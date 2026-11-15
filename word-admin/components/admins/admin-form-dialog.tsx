"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  createAdminAction,
  updateAdminAction,
} from "@/app/actions/admins";
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
import {
  ADMIN_ROLE_LABELS,
  type AdminPublic,
  type AdminRole,
} from "@/lib/types";

export function AdminFormDialog({
  open,
  onOpenChange,
  admin,
  currentAdminId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: AdminPublic;
  currentAdminId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AdminFormContent
          admin={admin}
          currentAdminId={currentAdminId}
          onDone={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}

function AdminFormContent({
  admin,
  currentAdminId,
  onDone,
}: {
  admin?: AdminPublic;
  currentAdminId: string;
  onDone: () => void;
}) {
  const isEdit = Boolean(admin);
  const isSelf = admin?.id === currentAdminId;
  const [form, setForm] = useState({
    name: admin?.name ?? "",
    email: admin?.email ?? "",
    password: "",
    role: (admin?.role ?? "admin") as AdminRole,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = isEdit
        ? await updateAdminAction({ id: admin!.id, ...form })
        : await createAdminAction(form);

      if (result.ok) {
        onDone();
        return;
      }
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
    });
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? "编辑管理员" : "新增管理员"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "修改管理员信息或角色；密码留空则保持不变。"
            : "为团队成员创建后台账号，并分配对应的角色权限。"}
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
          <Label htmlFor="admin-name">姓名</Label>
          <Input
            id="admin-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="请输入姓名"
            aria-invalid={Boolean(fieldErrors.name)}
            required
          />
          {fieldErrors.name ? (
            <p className="text-xs text-destructive">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-email">邮箱</Label>
          <Input
            id="admin-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="admin@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            required
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">
            {isEdit ? "新密码（可选）" : "初始密码"}
          </Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder={isEdit ? "留空则不修改密码" : "至少 6 位字符"}
            aria-invalid={Boolean(fieldErrors.password)}
            minLength={6}
            required={!isEdit}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>角色</Label>
          <Select
            value={form.role}
            disabled={isSelf}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                role: value as AdminRole,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择角色" />
            </SelectTrigger>
            <SelectContent>
              {(["admin", "super_admin"] as AdminRole[]).map((role) => (
                <SelectItem key={role} value={role}>
                  {ADMIN_ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSelf ? (
            <p className="text-xs text-muted-foreground">
              不能修改当前登录账号的系统管理员角色。
            </p>
          ) : null}
          {fieldErrors.role ? (
            <p className="text-xs text-destructive">{fieldErrors.role}</p>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              取消
            </Button>
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {isEdit ? "保存修改" : "创建管理员"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
