import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest, // Request를 NextRequest로 변경 (표준 규격)
  context: { params: Promise<{ id: string }> } // params를 Promise 타입으로 정의
) {
  // 1. context.params를 await하여 id를 안전하게 추출합니다.
  const { id } = await context.params;

  try {
    // 2. MySQL의 views 컬럼을 1 증가시키는 쿼리 실행
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