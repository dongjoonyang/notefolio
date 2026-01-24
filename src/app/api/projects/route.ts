export const dynamic = 'force-dynamic'; 

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// --- 1. 저장(POST) 기능 ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 💡 status 추가
    const { title, content, categoryName, thumbnail, isVisible, showInAll, status } = body;

    // 💡 임시저장(DRAFT)일 때는 제목만 있어도 저장 가능하도록 필수값 체크 완화 가능
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
    // 💡 status 기본값 설정 (전달되지 않으면 DRAFT)
    const finalStatus = status || 'DRAFT';

    // 💡 INSERT 문에 status 컬럼 추가
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

// --- 2. 불러오기(GET) 기능 ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "6"); 
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const isAdmin = searchParams.get("isAdmin") === "true"; // 💡 관리자 여부 확인용 파라미터 추가 제안
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT 
        p.id, p.title, p.description, p.thumbnail, 
        p.isVisible, 
        p.showInAll, 
        p.status,  /* 💡 status 선택 추가 */
        c.name as categoryName, 
        IFNULL(c.isVisible, 1) as categoryIsVisible,
        p.createdAt, p.sortOrder,
        (SELECT COUNT(*) FROM ProjectLike WHERE projectId = p.id) as likeCount,
        (SELECT COUNT(*) FROM Comment WHERE projectId = p.id) as commentCount
      FROM Project p 
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    // 💡 중요: 관리자가 아니라면 'PUBLISHED' 상태인 글만 가져옵니다.
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
    
    return new NextResponse(JSON.stringify(projects), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}