import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup"];
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const allCookies = Object.fromEntries(request.cookies);
  const cookieKeys = Object.keys(allCookies);
  console.log("[middleware]", pathname, "cookies:", cookieKeys);

  const sessionCookie = cookieKeys.find(
    (key) =>
      key.startsWith("better-auth.session_token") ||
      key.startsWith("__Secure-better-auth.session_token")
  );
  const sessionToken = sessionCookie
    ? request.cookies.get(sessionCookie)?.value
    : null;
  const isAuthenticated = !!sessionToken;

  console.log(
    "[middleware]",
    pathname,
    "sessionCookie:",
    sessionCookie,
    "isAuthenticated:",
    isAuthenticated
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isAuthenticated && (pathname === "/dashboard" || pathname === "/")) {
    console.log("[middleware] redirect -> /dashboard/vouchers");
    return NextResponse.redirect(new URL("/dashboard/vouchers", request.url));
  }
  if (!isAuthenticated && pathname === "/") {
    console.log("[middleware] redirect -> /login (root, unauth)");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    console.log("[middleware] redirect -> /dashboard (authed on auth route)");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicRoute && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    console.log("[middleware] redirect -> /login (protected, unauth)");
    return NextResponse.redirect(url);
  }

  console.log("[middleware] passthrough");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
