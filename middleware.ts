import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: NextRequest) {
  // Admin sayfalarını ve API'leri kontrol etmeye gerek yok, bunlar zaten auth tarafından korunuyor
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  // Auth sayfalarına erişime her zaman izin ver (login sayfası vb.)
  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // API için genel ayarlar ve asset'lere erişime her zaman izin ver
  if (
    request.nextUrl.pathname.startsWith("/api/settings") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/images") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/logo.png")
  ) {
    return NextResponse.next();
  }

  // Bakım modu kaldırıldı - Prisma Edge Runtime hatası nedeniyle
  return NextResponse.next();
}

// Bu middleware'in çalışacağı yolları belirt
export const config = {
  // /*: Tüm sayfalar
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
