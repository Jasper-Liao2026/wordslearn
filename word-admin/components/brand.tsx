import { BookOpenText } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({
  className,
  muted = false,
}: {
  className?: string;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          muted
            ? "bg-white/10 text-white"
            : "bg-primary text-primary-foreground"
        )}
      >
        <BookOpenText className="size-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-sm font-semibold tracking-tight",
            muted ? "text-white" : "text-foreground"
          )}
        >
          WordsLearn
        </span>
        <span
          className={cn(
            "text-xs",
            muted ? "text-white/60" : "text-muted-foreground"
          )}
        >
          管理后台
        </span>
      </span>
    </div>
  );
}
