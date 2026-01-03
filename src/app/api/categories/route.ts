import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// app/api/categories/route.ts

// 목록 불러오기
export async function GET() {
  try {
    // 💡 [수정] id ASC 대신 sortOrder ASC를 사용해야 드래그한 순서가 유지됩니다.
    const [categories]: any = await pool.query(
      "SELECT id, name, sortOrder FROM Category ORDER BY sortOrder ASC"
    );
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 추가하기 (새 카테고리를 항상 맨 뒤로 보내고 싶을 때 팁)
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    // ✨ [추천] 새 카테고리가 추가될 때 마지막 순서 다음으로 들어가도록 처리
    const [maxOrder]: any = await pool.query("SELECT MAX(sortOrder) as maxOrder FROM Category");
    const nextOrder = (maxOrder[0].maxOrder || 0) + 1;

    await pool.query(
      "INSERT INTO Category (name, sortOrder) VALUES (?, ?)", 
      [name, nextOrder]
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}