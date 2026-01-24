import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// 목록 불러오기
export async function GET() {
  try {
    // 💡 서브쿼리를 사용하여 각 카테고리별 프로젝트 개수(projectCount)를 함께 조회합니다.
    const [categories]: any = await pool.query(`
      SELECT 
        id, 
        name, 
        sortOrder, 
        isVisible,
        (SELECT COUNT(*) FROM Project p WHERE p.categoryId = Category.id) as projectCount
      FROM Category 
      ORDER BY sortOrder ASC
    `);
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 추가하기
export async function POST(request: Request) {
  try {
    const { name, isVisible } = await request.json(); 
    
    const [maxOrder]: any = await pool.query("SELECT MAX(sortOrder) as maxOrder FROM Category");
    const nextOrder = (maxOrder[0].maxOrder || 0) + 1;

    await pool.query(
      "INSERT INTO Category (name, sortOrder, isVisible) VALUES (?, ?, ?)", 
      [name, nextOrder, isVisible ?? 1]
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}