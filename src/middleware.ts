import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth; // Auth.js 세션 존재 여부 확인
  const { pathname } = req.nextUrl;

  // 1. 로그인된 상태에서 /login 접근 시 -> 관리자 메인(/admin)으로 리다이렉트
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', req.nextUrl.origin));
  }

  // 2. 로그인 안 된 상태에서 /admin 하위 모든 페이지 접근 시 -> 직접 만든 /login으로 리다이렉트
  if (!isLoggedIn && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  // 3. 응답 생성 및 캐시 방지
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
});

// 작동할 경로 범위 설정
export const config = {
  matcher: [
    '/admin/:path*', 
    '/login'
  ],
};