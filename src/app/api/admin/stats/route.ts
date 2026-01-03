import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // 1. 프로젝트 개수 (가장 중요)
    const [projectCountRes]: any = await pool.query("SELECT COUNT(*) as count FROM Project");
    const totalProjects = projectCountRes[0]?.count || 0;

    // 2. 최근 프로젝트 3개 (가장 중요)
    const [recentProjectsRes]: any = await pool.query(
      "SELECT id, title, createdAt FROM Project ORDER BY createdAt DESC LIMIT 3"
    );

    // 3. 오늘 방문자 수 (테이블이 없을 경우를 대비해 try-catch로 감싸기)
    let todayVisitors = 0;
    try {
      const [visitorRes]: any = await pool.query(`
        SELECT COUNT(DISTINCT ip) as count 
        FROM VisitorLog 
        WHERE DATE(visitedAt) = CURDATE()
      `);
      todayVisitors = visitorRes[0]?.count || 0;
    } catch (vError) {
      console.error("방문자 테이블 조회 실패 (무시됨):", vError);
    }

    // 최종 응답 데이터 구조 (프론트엔드와 일치해야 함)
    return NextResponse.json({
      totalProjects,
      recentProjects: recentProjectsRes || [],
      todayVisitors,
      totalMessages: 0 // 일단 0으로 고정
    });
  } catch (error: any) {
    console.error("전체 스탯 API 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}