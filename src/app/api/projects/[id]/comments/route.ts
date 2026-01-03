import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";

// 1. 해당 프로젝트의 댓글 목록 가져오기
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    /**
     * 💡 [고급 정렬 로직]
     * 1. IFNULL(parentId, id) DESC: 
     * 부모와 그에 딸린 대댓글을 하나의 '그룹'으로 묶고, 최신 그룹을 맨 위로 올립니다.
     * 2. parentId IS NOT NULL ASC: 
     * 같은 그룹 내에서 부모 댓글(parentId가 NULL)이 무조건 자식보다 위에 오게 합니다.
     * 3. createdAt ASC: 
     * 대댓글들 사이에서는 먼저 작성된 대화가 위로 오게 하여 흐름을 유지합니다.
     */
    const [comments]: any = await pool.query(
      `SELECT id, author, content, createdAt, isAdmin, parentId 
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

// 2. 댓글 및 대댓글 작성하기
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { author, password, content, parentId } = await request.json();

    // 💡 관리자 세션 확인 (서버 사이드 쿠키 체크)
    const cookieStore = await cookies();
    const isAdmin = cookieStore.has("admin_session"); 

    // 💡 INSERT 실행
    // parentId가 있으면 대댓글, 없으면 일반 댓글(NULL)
    await pool.query(
      "INSERT INTO Comment (projectId, author, password, content, isAdmin, parentId) VALUES (?, ?, ?, ?, ?, ?)",
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