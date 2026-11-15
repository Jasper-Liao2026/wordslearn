import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
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
  return NextResponse.json(await getStudyState(user.id, bookld));
}
