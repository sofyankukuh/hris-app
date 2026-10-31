// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Jika belum login, dan bukan di halaman login, tendang ke /login
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika sudah login, jangan biarkan buka /login lagi (lempar ke dashboard)
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Lindungi semua halaman kecuali aset statis & API Auth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};