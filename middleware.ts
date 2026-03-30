import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET
  ? new TextEncoder().encode(process.env.AUTH_SECRET)
  : null;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("seniorstay_session")?.value;
  const pathname = request.nextUrl.pathname;

  if (!token || !secret) {
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"]
};
