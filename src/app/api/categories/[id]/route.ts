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
  const body = await req.json();
  const { name, isVisible } = body;

  try {
    // 💡 isVisible이 undefined가 아닐 때, 숫자형(0 또는 1)으로 변환하여 처리
    const numericVisible = isVisible !== undefined ? (isVisible ? 1 : 0) : undefined;

    if (numericVisible !== undefined && name !== undefined) {
      // 이름과 노출상태 모두 변경 시
      await pool.query("UPDATE Category SET name = ?, isVisible = ? WHERE id = ?", [name, numericVisible, id]);
    } else if (numericVisible !== undefined) {
      // 노출 상태(스위치)만 변경 시
      await pool.query("UPDATE Category SET isVisible = ? WHERE id = ?", [numericVisible, id]);
    } else if (name !== undefined) {
      // 이름만 변경 시
      await pool.query("UPDATE Category SET name = ? WHERE id = ?", [name, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}