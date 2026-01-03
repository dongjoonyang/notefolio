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

// 수정
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name } = await req.json();
  try {
    await pool.query("UPDATE Category SET name = ? WHERE id = ?", [name, id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}