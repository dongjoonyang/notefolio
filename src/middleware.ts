import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // --- [진단용 로그] Vercel Dashboard > Logs에서 확인 가능 ---
  console.log(`--- [Middleware Log] ---`);
  console.log(`요청 경로: ${pathname}`);
  console.log(`로그인 상태(isLoggedIn): ${isLoggedIn}`);
  console.log(`세션 데이터 존재 여부: ${req.auth ? "YES" : "NO"}`);
  console.log(`-------------------------`);

  // 1. 로그인된 상태에서 /login 접근 시 -> /admin으로
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', req.nextUrl.origin));
  }

  // 2. 로그인 안 된 상태에서 /admin 접근 시 -> /login으로
  if (!isLoggedIn && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
});

export const config = {
  matcher: [
    '/admin/:path*', 
    '/login'
  ],
};