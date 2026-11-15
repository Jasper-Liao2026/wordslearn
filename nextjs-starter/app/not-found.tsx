import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <SearchX className="size-8 text-muted-foreground" />
      <p className="text-base font-semibold">页面不存在</p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        你访问的页面可能已被移除或地址有误
      </p>
      <Button asChild className="mt-2">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
