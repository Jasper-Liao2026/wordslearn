import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getBook } from "@/lib/data/books";
import { getStudyState } from "@/lib/data/progress";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookld: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { bookld } = await params;
  const book = await getBook(bookld);
  if (!book) {
    return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  }

  return NextResponse.json(await getStudyState(user.id, bookld));
}
