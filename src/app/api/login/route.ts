import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const isValidUser = 
      email === process.env.ADMIN_EMAIL && 
      password === process.env.ADMIN_PASSWORD;

    if (isValidUser) {
      const cookieStore = await cookies();
      const MAX_AGE = 60 * 60 * 24 * 30; // 30일

      // 1. 보안용 세션 쿠키 (JS 접근 불가)
      cookieStore.set("admin_session", "is_logged_in", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: MAX_AGE, 
      });

      // 2. UI 동기화용 보조 쿠키 (JS 접근 가능)
      cookieStore.set("is_admin", "true", {
        httpOnly: false, // 핵심: 자바스크립트가 읽을 수 있음
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: MAX_AGE,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "이메일 또는 비밀번호가 틀렸습니다." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}