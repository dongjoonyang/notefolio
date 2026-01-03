import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  try {
    const { ids } = await request.json(); // 프론트에서 보낸 ID 배열 [10, 5, 2...]

    await connection.beginTransaction();

    // 배열의 인덱스 순서대로 sortOrder를 0, 1, 2...로 업데이트
    for (let i = 0; i < ids.length; i++) {
      await connection.query(
        "UPDATE Project SET sortOrder = ? WHERE id = ?",
        [i, ids[i]]
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    await connection.rollback();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}