import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const [rows]: any = await pool.query(`
      SELECT p.*, c.name as categoryName 
      FROM Project p 
      JOIN Category c ON p.categoryId = c.id 
      WHERE p.id = ?`, [id]);

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}