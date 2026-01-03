import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error: any) {
    console.error("삭제 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const body = await request.json();
      
      // ✨ 1. body에서 thumbnail을 추가로 추출합니다.
      const { title, content, categoryName, thumbnail } = body; 
  
      // 2. 카테고리 ID 찾기
      const [categories]: any = await pool.query(
        "SELECT id FROM Category WHERE name = ?", 
        [categoryName]
      );

      if (categories.length === 0) {
        return NextResponse.json({ error: "존재하지 않는 카테고리입니다." }, { status: 400 });
      }
  
      // ✨ 3. 데이터 업데이트 쿼리에 thumbnail = ? 를 추가합니다.
      // (주의: DB의 thumbnail 컬럼이 LONGTEXT 타입이어야 합니다!)
      await pool.query(
        "UPDATE Project SET title = ?, description = ?, categoryId = ?, thumbnail = ? WHERE id = ?",
        [title, content, categories[0].id, thumbnail, id]
      );
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("수정 API 에러:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }