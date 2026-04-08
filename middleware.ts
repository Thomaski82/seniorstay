import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET
  ? new TextEncoder().encode(process.env.AUTH_SECRET)
  : null;

export async function middleware(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("lang");
  const token = request.cookies.get("seniorstay_session")?.value;
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  if (locale === "pl" || locale === "en") {
    response.cookies.set("site_locale", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  if (!token || !secret) {
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch {
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
