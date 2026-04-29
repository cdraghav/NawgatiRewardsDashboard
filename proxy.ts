import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup"];
const authRoutes = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = Object.keys(Object.fromEntries(request.cookies)).find(
    (key) => key.startsWith("better-auth.session_token")
  );
  const sessionToken = sessionCookie
    ? request.cookies.get(sessionCookie)?.value
    : null;
  const isAuthenticated = !!sessionToken;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isAuthenticated && (pathname === "/dashboard" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard/vouchers", request.url));
  }
  if (!isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
