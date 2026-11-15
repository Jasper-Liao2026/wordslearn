import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "wordslearn_session";

/**
 * 只判断 Cookie 是否存在，快速拦截游客；
 * 会话有效期仍由页面 / 接口中的 getCurrentUser() 查库校验。
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && pathname.startsWith("/study")) {
    const url = new URL("/profile", request.url);
    url.searchParams.set("auth", "1");
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/study/:path*"],
};
