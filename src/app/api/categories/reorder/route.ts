import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  try {
    const { ids } = await request.json(); // ['ID1', 'ID2', 'ID3'...]

    await connection.beginTransaction();
    for (let i = 0; i < ids.length; i++) {
      await connection.query(
        "UPDATE Category SET sortOrder = ? WHERE id = ?",
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