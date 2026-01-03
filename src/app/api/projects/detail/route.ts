import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID가 없습니다." }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(`
      SELECT p.*, c.name as categoryName 
      FROM Project p 
      JOIN Category c ON p.categoryId = c.id 
      WHERE p.id = ?`, [id]);

    // 데이터가 없으면 빈 객체 대신 null이나 404를 반환
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "데이터를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}