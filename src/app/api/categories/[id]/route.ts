import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// 삭제
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await pool.query("DELETE FROM Category WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "이 카테고리를 사용하는 프로젝트가 있어 삭제할 수 없습니다." }, { status: 500 });
  }
}

// 수정 (이름 수정 및 노출 상태 토글 공용)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, isVisible } = await req.json(); // 프론트에서 보낸 name과 isVisible을 받음

  try {
    // 💡 name과 isVisible 중 들어온 값만 업데이트하거나 둘 다 업데이트하도록 처리
    if (isVisible !== undefined && name !== undefined) {
      // 이름과 노출상태 모두 변경 시
      await pool.query("UPDATE Category SET name = ?, isVisible = ? WHERE id = ?", [name, isVisible, id]);
    } else if (isVisible !== undefined) {
      // 노출 상태(스위치)만 변경 시
      await pool.query("UPDATE Category SET isVisible = ? WHERE id = ?", [isVisible, id]);
    } else if (name !== undefined) {
      // 이름만 변경 시
      await pool.query("UPDATE Category SET name = ? WHERE id = ?", [name, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}