import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getWordByRank } from "@/lib/data/words";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookld: string; wordRank: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { bookld, wordRank } = await params;
  const word = await getWordByRank(bookld, Number(wordRank));

  if (!word) {
    return NextResponse.json({ error: "单词不存在" }, { status: 404 });
  }

  return NextResponse.json({ word });
}
