import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { del } from '@vercel/blob'; // ✨ 추가

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // --- [추가 기능: 스토리지 파일 삭제] ---
    // 1. 삭제 전 DB에서 이미지 URL들 가져오기
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows.length > 0) {
      const project = rows[0];
      const deletePromises = [];

      // 썸네일 삭제 추가
      if (project.thumbnail && project.thumbnail.includes("public.blob.vercel-storage.com")) {
        deletePromises.push(del(project.thumbnail));
      }

      // 본문(description) 내 이미지 URL 추출 및 삭제 추가
      const blobUrlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s"']+/g;
      const urlsInContent = project.description?.match(blobUrlRegex);
      if (urlsInContent) {
        urlsInContent.forEach((url: string) => deletePromises.push(del(url)));
      }

      if (deletePromises.length > 0) await Promise.all(deletePromises);
    }
    // --- [추가 기능 끝] ---

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

    // --- [추가 기능: 썸네일 교체 시 기존 파일 삭제] ---
    const [currentProject]: any = await pool.query(
      "SELECT thumbnail FROM Project WHERE id = ?",
      [id]
    );
    
    // 기존 썸네일이 있고, 새로 들어온 썸네일과 주소가 다르다면 기존 파일 삭제
    if (
      currentProject[0]?.thumbnail && 
      currentProject[0].thumbnail !== thumbnail &&
      currentProject[0].thumbnail.includes("public.blob.vercel-storage.com")
    ) {
      await del(currentProject[0].thumbnail);
    }
    // --- [추가 기능 끝] ---

    // 2. 카테고리 ID 찾기
    const [categories]: any = await pool.query(
      "SELECT id FROM Category WHERE name = ?",
      [categoryName]
    );

    if (categories.length === 0) {
      return NextResponse.json({ error: "존재하지 않는 카테고리입니다." }, { status: 400 });
    }

    // 3. 데이터 업데이트
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