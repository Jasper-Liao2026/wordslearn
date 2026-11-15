"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("页面渲染失败", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="text-base font-semibold">页面出错了</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        可能是网络波动引起的，稍后重试即可
      </p>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/">返回首页</Link>
        </Button>
        <Button onClick={reset}>
          <RefreshCw className="size-4" />
          重试
        </Button>
      </div>
    </div>
  );
}
