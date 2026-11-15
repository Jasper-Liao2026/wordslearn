"use client";

import {
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";

import { deleteAdminAction } from "@/app/actions/admins";
import { AdminFormDialog } from "@/components/admins/admin-form-dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { ADMIN_ROLE_LABELS, type AdminPublic } from "@/lib/types";

type FormState =
  | { mode: "create" }
  | { mode: "edit"; admin: AdminPublic }
  | null;

function initialsOf(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "A";
}

export function AdminUsersView({
  admins,
  currentAdmin,
}: {
  admins: AdminPublic[];
  currentAdmin: AdminPublic;
}) {
  const [formState, setFormState] = useState<FormState>(null);
  const [deleting, setDeleting] = useState<AdminPublic | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const superAdminCount = admins.filter(
    (admin) => admin.role === "super_admin"
  ).length;

  function confirmDelete() {
    if (!deleting) {
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAdminAction(deleting.id);
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
          label="管理员总数"
          value={formatNumber(admins.length)}
          hint="包含系统管理员"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="系统管理员"
          value={formatNumber(superAdminCount)}
          hint="拥有账号管理权限"
          icon={<ShieldCheck className="size-5" />}
        />
        <StatCard
          label="当前登录"
          value={currentAdmin.name}
          hint={currentAdmin.email}
          icon={<UserRound className="size-5" />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div>
            <p className="text-sm font-medium">管理员列表</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              共 {admins.length} 个后台账号
            </p>
          </div>
          <Button onClick={() => setFormState({ mode: "create" })}>
            <Plus />
            新增管理员
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-4">管理员</TableHead>
              <TableHead className="px-4">邮箱</TableHead>
              <TableHead className="px-4">角色</TableHead>
              <TableHead className="px-4">注册时间</TableHead>
              <TableHead className="px-4 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => {
              const isSelf = admin.id === currentAdmin.id;
              return (
                <TableRow key={admin.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {initialsOf(admin.name)}
                      </span>
                      <div>
                        <p className="flex items-center gap-2 font-medium">
                          {admin.name}
                          {isSelf ? (
                            <Badge variant="secondary" className="text-[10px]">
                              当前账号
                            </Badge>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {admin.email}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant={
                        admin.role === "super_admin" ? "default" : "secondary"
                      }
                    >
                      {ADMIN_ROLE_LABELS[admin.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {formatDate(admin.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        title="编辑管理员"
                        aria-label={`编辑 ${admin.name}`}
                        onClick={() => setFormState({ mode: "edit", admin })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title={
                          isSelf
                            ? "不能删除当前登录账号"
                            : "删除管理员"
                        }
                        aria-label={`删除 ${admin.name}`}
                        disabled={isSelf}
                        onClick={() => {
                          setDeleteError(null);
                          setDeleting(admin);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          当前登录账号不可删除；管理员数据保存在 Supabase 数据库中。
        </div>
      </div>

      <AdminFormDialog
        key={
          formState?.mode === "edit" ? `edit-${formState.admin.id}` : "create"
        }
        open={Boolean(formState)}
        onOpenChange={(open) => {
          if (!open) {
            setFormState(null);
          }
        }}
        admin={formState?.mode === "edit" ? formState.admin : undefined}
        currentAdminId={currentAdmin.id}
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
            <DialogTitle>删除管理员</DialogTitle>
            <DialogDescription>
              确定要删除管理员「{deleting?.name}」（{deleting?.email}）吗？
              删除后该账号将无法登录后台。
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
