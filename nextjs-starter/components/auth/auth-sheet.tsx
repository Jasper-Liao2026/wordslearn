"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { useToast } from "@/lib/app/toast";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;

function safeNext(value: string | null) {
  if (!value) return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export function AuthSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { show } = useToast();

  const open = searchParams.get("auth") === "1";
  const expired = searchParams.get("reason") === "expired";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    const timer = window.setTimeout(() => emailRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    params.delete("next");
    params.delete("reason");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pathname, searchParams]);

  if (!open) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setError("请输入有效的邮箱地址");
      return;
    }
    if (mode === "signup" && !STRONG_PASSWORD_RE.test(password)) {
      setError("密码需 8–64 位，且同时包含字母和数字");
      return;
    }
    if (mode === "signin" && password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);

    try {
      const result =
        mode === "signup"
          ? await signUpAction({ email: normalizedEmail, password })
          : await signInAction({ email: normalizedEmail, password });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      show(mode === "signup" ? "注册成功" : "登录成功", "success");
      const next = safeNext(searchParams.get("next"));
      router.replace(next ?? pathname, { scroll: false });
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="关闭登录弹窗"
        className="absolute inset-0 animate-in fade-in bg-black/40 backdrop-blur-[2px]"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "signin" ? "登录" : "注册"}
        className="relative w-full max-w-[480px] animate-in slide-in-from-bottom-6 fade-in rounded-t-3xl border-t border-border/70 bg-background px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 shadow-2xl duration-200"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-semibold">
            {mode === "signin" ? "登录 WordsLearn" : "创建账号"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {expired
              ? "登录已过期，请重新登录后继续学习"
              : "登录后可同步学习进度，随时继续上次的学习"}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(
            [
              { value: "signin", label: "登录" },
              { value: "signup", label: "注册" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => switchMode(item.value)}
              className={cn(
                "h-9 rounded-lg text-sm transition-colors",
                mode === item.value
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">邮箱</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={emailRef}
                id="auth-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 pl-9 text-base"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password">密码</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                placeholder={mode === "signup" ? "至少 8 位，含字母和数字" : "至少 6 位"}
                className="h-11 pl-9 pr-10 text-base"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-confirm">确认密码</Label>
              <Input
                id="auth-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="再次输入密码"
                className="h-11 text-base"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full text-base"
            disabled={submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "登录" : "注册并登录"}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            登录状态将保持 7 天，学习记录实时同步
          </p>
        </form>
      </div>
    </div>
  );
}
