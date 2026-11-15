import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getWordsAfter } from "@/lib/data/words";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 20;

/** 学习页预取窗口：返回 wordRand > after 的前 limit 个单词 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookld: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { bookld } = await params;
  const searchParams = new URL(request.url).searchParams;
  const after = Number(searchParams.get("after") ?? 0);
  const limitValue = Number(searchParams.get("limit") ?? 8);

  if (!Number.isFinite(after) || after < 0) {
    return NextResponse.json({ error: "参数不合法" }, { status: 400 });
  }

  const limit = Number.isFinite(limitValue)
    ? Math.min(Math.max(Math.trunc(limitValue), 1), MAX_LIMIT)
    : 8;

  return NextResponse.json({ words: await getWordsAfter(bookld, after, limit) });
}
