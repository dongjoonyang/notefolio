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

// ... 기존 DELETE 함수 아래에 추가하세요

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const { content, password } = await request.json();

    // 1. 관리자 여부 확인 (쿠키 이름 admin_session 확인)
    const cookieStore = await cookies();
    const isAdmin = !!cookieStore.get("admin_session");

    // 2. 권한 체크
    const [rows]: any = await pool.query("SELECT password, isAdmin FROM Comment WHERE id = ?", [commentId]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    const targetComment = rows[0];

    if (isAdmin) {
      // 관리자일 경우: 본인이 쓴 글(isAdmin=1)만 수정 가능
      if (Number(targetComment.isAdmin) !== 1) {
        return NextResponse.json({ error: "관리자는 관리자 댓글만 수정 가능합니다." }, { status: 403 });
      }
    } else {
      // 일반 사용자일 경우: 비밀번호 일치 확인
      if (targetComment.password !== password) {
        return NextResponse.json({ error: "비밀번호가 틀립니다." }, { status: 401 });
      }
    }

    // 3. 수정 실행 (내용 업데이트 및 isUpdated 표시)
    await pool.query(
      "UPDATE Comment SET content = ?, isUpdated = 1 WHERE id = ?",
      [content, commentId]
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("수정 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}