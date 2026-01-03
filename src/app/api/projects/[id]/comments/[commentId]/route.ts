import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const { password } = await request.json();

    // 1. 관리자 여부 확인 (쿠키 이름 admin_session 확인!)
    const cookieStore = await cookies();
    const isAdmin = !!cookieStore.get("admin_session");

    // 2. 관리자가 아닐 때만 비밀번호 체크 로직 실행
    if (!isAdmin) {
      const [rows]: any = await pool.query("SELECT password FROM Comment WHERE id = ?", [commentId]);
      
      if (rows.length === 0) {
        return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
      }

      if (rows[0].password !== password) {
        return NextResponse.json({ error: "비밀번호가 틀립니다." }, { status: 401 });
      }
    }

    // 3. 삭제 실행 (관리자면 바로 이리로 넘어옴)
    await pool.query("DELETE FROM Comment WHERE id = ?", [commentId]);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("삭제 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}