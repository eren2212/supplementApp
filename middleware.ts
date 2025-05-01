import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!session?.user;

  // Always allow access to maintenance check API and admin login page and related assets
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/maintenance-check"
  ) {
    return NextResponse.next();
  }

  // For maintenance mode check, we need to use cookies instead of direct prisma call
  // because prisma cannot run in edge runtime (middleware)
  const maintenanceCookie = request.cookies.get("maintenance_mode");
  const isMaintenanceMode = maintenanceCookie?.value === "true";

  // If maintenance mode is active and user is not admin, redirect to maintenance page
  // except for admin login page and api routes needed for login
  if (
    isMaintenanceMode &&
    (!isLoggedIn || session?.user?.role !== "ADMIN") &&
    pathname !== "/maintenance"
  ) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  if (pathname.startsWith("/odeme") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/odeme-basarili") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Admin and doctor page protection
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    (!isLoggedIn || session?.user?.role !== "ADMIN") &&
    pathname !== "/admin/login"
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (
    pathname.startsWith("/doctor") &&
    (!isLoggedIn || session?.user?.role !== "DOCTOR")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Auth pages access
  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // API and asset access
  if (
    request.nextUrl.pathname.startsWith("/api/settings") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/logo.png")
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Bu middleware'in çalışacağı yolları belirt
export const config = {
  // /*: Tüm sayfalar
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
