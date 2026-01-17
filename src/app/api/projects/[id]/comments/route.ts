import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

// 1. 해당 프로젝트의 댓글 목록 가져오기
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [comments]: any = await pool.query(
      `SELECT id, author, content, createdAt, isAdmin, parentId, isUpdated 
       FROM Comment 
       WHERE projectId = ? 
       ORDER BY 
         IFNULL(parentId, id) DESC, 
         parentId IS NOT NULL ASC, 
         createdAt ASC`,
      [id]
    );

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error("댓글 조회 오류:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. 댓글 및 대댓글 작성하기 (기존과 동일)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { author, password, content, parentId } = await request.json();

    const cookieStore = await cookies();
    const isAdmin = cookieStore.has("admin_session"); 

    await pool.query(
      "INSERT INTO Comment (projectId, author, password, content, isAdmin, parentId, isUpdated) VALUES (?, ?, ?, ?, ?, ?, 0)",
      [
        id, 
        author, 
        password, 
        content, 
        isAdmin ? 1 : 0, 
        parentId || null
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}