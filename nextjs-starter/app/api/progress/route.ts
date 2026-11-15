import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import {
  getProgressList,
  resetBookProgress,
  saveWordProgress,
} from "@/lib/data/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  return NextResponse.json({ progress: await getProgressList(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    bookld?: string;
    wordRank?: number;
  } | null;

  if (!body?.bookld || typeof body.wordRank !== "number") {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const result = await saveWordProgress({
    userId: user.id,
    bookld: body.bookld,
    wordRank: body.wordRank,
  });

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const bookld = new URL(request.url).searchParams.get("bookld");
  if (!bookld) {
    return NextResponse.json({ error: "缺少 bookld" }, { status: 400 });
  }

  await resetBookProgress(user.id, bookld);
  return NextResponse.json({ ok: true });
}
