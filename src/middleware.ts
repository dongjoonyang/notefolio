import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');
  const { pathname } = request.nextUrl;

  // 1. 로그인된 상태에서 /login 접근 시 -> /admin으로 리다이렉트
  if (adminSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 2. 로그인 안 된 상태에서 /admin 하위 접근 시 -> /login으로 리다이렉트
  if (!adminSession && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. 일반적인 응답 생성
  const response = NextResponse.next();

  // 💡 [중요] 브라우저 캐시 방지 헤더 추가
  // 이 헤더가 있으면 뒤로가기 시 브라우저가 이전 화면을 서버 거치지 않고 보여주는 것을 막아줍니다.
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}

// 작동할 경로 범위 설정
export const config = {
  matcher: [
    '/admin/:path*', 
    '/login'
  ],
};