import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeId = searchParams.get("excludeId"); // 현재 보고 있는 글은 제외

  try {
    const query = `
      SELECT 
        p.id, p.title, p.thumbnail, 
        (SELECT COUNT(*) FROM ProjectLike WHERE projectId = p.id) as likeCount
      FROM Project p
      WHERE p.isVisible = 1 ${excludeId ? `AND p.id != ${excludeId}` : ""}
      ORDER BY 
        likeCount DESC, -- 좋아요 많은 순
        RAND()          -- 좋아요가 같거나 없으면 랜덤
      LIMIT 4;          -- 4개만 추천
    `;

    const [projects]: any = await pool.query(query);
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}