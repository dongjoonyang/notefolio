import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = process.env.BLOB_READ_WRITE_TOKEN; // 토큰 가져오기

    // 1. DB에서 삭제할 데이터의 주소 먼저 읽기
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const project = rows[0];
      const deletePromises = [];

      // 썸네일 삭제
      if (project.thumbnail && project.thumbnail.includes("public.blob.vercel-storage.com")) {
        deletePromises.push(del(project.thumbnail, { token }));
      }

      // 본문(description) 이미지 삭제
      const blobUrlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"']+/g;
      const urlsInContent = project.description?.match(blobUrlRegex);
      if (urlsInContent) {
        urlsInContent.forEach((url: string) => {
          deletePromises.push(del(url, { token }));
        });
      }

      if (deletePromises.length > 0) await Promise.all(deletePromises);
    }

    // 2. DB에서 데이터 삭제
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);
    
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error: any) {
    console.error("삭제 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, categoryName, thumbnail } = body;
    const token = process.env.BLOB_READ_WRITE_TOKEN; // 토큰 가져오기

    // 1. 기존 썸네일 지우기 로직
    const [currentProject]: any = await pool.query(
      "SELECT thumbnail FROM Project WHERE id = ?",
      [id]
    );
    
    if (
      currentProject[0]?.thumbnail && 
      currentProject[0].thumbnail !== thumbnail &&
      currentProject[0].thumbnail.includes("public.blob.vercel-storage.com")
    ) {
      await del(currentProject[0].thumbnail, { token });
    }

    // 2. 카테고리 찾기
    const [categories]: any = await pool.query("SELECT id FROM Category WHERE name = ?", [categoryName]);
    if (categories.length === 0) return NextResponse.json({ error: "카테고리 없음" }, { status: 400 });

    // 3. 업데이트 (DB의 description 컬럼에 content 내용을 넣음)
    await pool.query(
      "UPDATE Project SET title = ?, description = ?, categoryId = ?, thumbnail = ? WHERE id = ?",
      [title, content, categories[0].id, thumbnail, id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("수정 API 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}