import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// 목록 불러오기
export async function GET() {
  try {
    // 💡 [수정] isVisible을 SELECT 문에 추가했습니다.
    const [categories]: any = await pool.query(
      "SELECT id, name, sortOrder, isVisible FROM Category ORDER BY sortOrder ASC"
    );
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 추가하기
export async function POST(request: Request) {
  try {
    const { name, isVisible } = await request.json(); // 💡 프론트에서 보낸 isVisible 받기
    
    const [maxOrder]: any = await pool.query("SELECT MAX(sortOrder) as maxOrder FROM Category");
    const nextOrder = (maxOrder[0].maxOrder || 0) + 1;

    // 💡 [수정] INSERT 문에 isVisible을 추가했습니다. (기본값 1 설정)
    await pool.query(
      "INSERT INTO Category (name, sortOrder, isVisible) VALUES (?, ?, ?)", 
      [name, nextOrder, isVisible ?? 1]
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}