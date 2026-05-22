import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("icu_auth")?.value;
  const { pathname } = req.nextUrl;

  // ログインページとAPIは通す
  if (pathname === "/" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (auth !== "1") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
