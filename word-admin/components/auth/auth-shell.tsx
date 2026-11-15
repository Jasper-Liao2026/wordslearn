import { BarChart3, BookOpenText, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Brand } from "@/components/brand";

const highlights = [
  {
    icon: BookOpenText,
    title: "集中管理单词书",
    description: "维护词书信息、词汇量与发布状态。",
  },
  {
    icon: ShieldCheck,
    title: "管理员权限控制",
    description: "区分超级管理员与普通管理员，操作可追溯。",
  },
  {
    icon: BarChart3,
    title: "一目了然的数据概览",
    description: "词书规模与团队账号情况尽在掌握。",
  },
];

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <Brand muted className="relative" />

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            让每一本单词书
            <br />
            都被认真管理
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/60">
            WordsLearn 管理后台帮助团队维护词书内容、管理管理员账号，并为学习端提供稳定的数据支撑。
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © 2026 WordsLearn · 管理后台
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Brand className="mb-10 lg:hidden" />
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
