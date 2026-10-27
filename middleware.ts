import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protect /dashboard and /doc/* routes.
 * The JWT lives in an httpOnly cookie set by the server — we just check
 * its presence here; the server validates the signature on every API call.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/doc/");

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/doc/:path*", "/login", "/signup"],
};

