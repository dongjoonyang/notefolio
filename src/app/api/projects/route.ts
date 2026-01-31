export const dynamic = 'force-dynamic'; 

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { headers } from "next/headers";

// --- 1. 저장(POST) 기능 (기존 유지) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, categoryName, thumbnail, isVisible, showInAll, status } = body;

    if (!title || !categoryName) {
      return NextResponse.json({ error: "제목과 카테고리는 필수입니다." }, { status: 400 });
    }

    const [categories]: any = await pool.query(
      "SELECT id FROM Category WHERE name = ?", 
      [categoryName]
    );

    if (categories.length === 0) {
      return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 400 });
    }

    const categoryId = categories[0].id;

    const [minOrderResult]: any = await pool.query("SELECT MIN(sortOrder) as minOrder FROM Project");
    const newOrder = (minOrderResult[0].minOrder !== null ? minOrderResult[0].minOrder : 0) - 1;

    const finalVisibility = isVisible !== undefined ? (isVisible ? 1 : 0) : 1;
    const finalShowInAll = showInAll !== undefined ? (showInAll ? 1 : 0) : 1;
    const finalStatus = status || 'DRAFT';

    const [result]: any = await pool.query(
      "INSERT INTO Project (title, description, categoryId, thumbnail, sortOrder, isVisible, showInAll, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [title, content, categoryId, thumbnail, newOrder, finalVisibility, finalShowInAll, finalStatus]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error: any) {
    console.error("DB 저장 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 2. 불러오기(GET) 기능 (파라미터 순서 및 IP 식별 수정) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "6"); 
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const isAdmin = searchParams.get("isAdmin") === "true"; 
  const offset = (page - 1) * limit;

  // 💡 상세페이지 actions.ts와 동일한 방식으로 IP 추출
  const headerList = await headers();
  const userIp = headerList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  try {
    // 💡 중요: EXISTS 내부의 ?가 쿼리상 가장 먼저 나오므로 params[0]에 userIp 배치
    let params: any[] = [userIp];

    let query = `
      SELECT 
        p.id, p.title, p.description, p.thumbnail, 
        p.isVisible, 
        p.showInAll, 
        p.status,
        p.views,
        c.name as categoryName, 
        IFNULL(c.isVisible, 1) as categoryIsVisible,
        p.createdAt, p.sortOrder,
        (SELECT COUNT(*) FROM ProjectLike WHERE projectId = p.id) as likeCount,
        (SELECT COUNT(*) FROM Comment WHERE projectId = p.id) as commentCount,
        /* 💡 수정: ipAddress 컬럼을 현재 유저의 IP와 대조 (나의 좋아요만 빨간색으로 표시) */
        EXISTS(SELECT 1 FROM ProjectLike WHERE projectId = p.id AND ipAddress = ?) as isLiked
      FROM Project p 
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE 1=1
    `;
    
    if (!isAdmin) {
      query += ` AND p.status = 'PUBLISHED'`;
    }

    if (category && category !== "all") {
      query += ` AND c.name = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
      const searchKeyword = `%${search}%`;
      params.push(searchKeyword, searchKeyword);
    }

    query += ` ORDER BY p.sortOrder ASC, p.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [projects]: any = await pool.query(query, params);
    
    const projectsWithLikeStatus = projects.map((p: any) => ({
      ...p,
      isLiked: !!p.isLiked
    }));
    
    return new NextResponse(JSON.stringify(projectsWithLikeStatus), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error("SQL Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}