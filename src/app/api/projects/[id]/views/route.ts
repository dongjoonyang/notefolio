import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Next.js 15 이상 대응을 위해 await params 사용
  const { id } = await (params as any);

  try {
    // MySQL의 views 컬럼을 1 증가시키는 쿼리
    await pool.query(
      "UPDATE Project SET views = IFNULL(views, 0) + 1 WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("조회수 업데이트 실패:", error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}