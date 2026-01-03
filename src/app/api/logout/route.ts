import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // 두 쿠키 모두 삭제
  cookieStore.delete("admin_session");
  cookieStore.delete("is_admin");
  
  return NextResponse.json({ success: true });
}