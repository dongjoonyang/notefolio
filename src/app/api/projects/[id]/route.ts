import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    // 1. DB에서 데이터 조회 (HTML 태그 포함된 상태)
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const project = rows[0];
      const urlsToDelete = new Set<string>();

      // 썸네일 URL 추출
      if (project.thumbnail && project.thumbnail.includes("public.blob.vercel-storage.com")) {
        urlsToDelete.add(project.thumbnail);
      }

      // 본문(HTML 태그) 내 URL 정밀 추출
      if (project.description) {
        // 따옴표(")나 공백 전까지만 주소로 인식하도록 정규식 강화
        const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;
        const matches = project.description.match(urlRegex);
        if (matches) {
          matches.forEach((url: string) => urlsToDelete.add(url));
        }
      }

      // Vercel Storage에서 실제 파일 삭제
      const deletePromises = Array.from(urlsToDelete).map(url => {
        console.log("🔥 삭제 시도 URL:", url);
        return del(url, { token }).catch(err => console.error("파일 삭제 실패:", url, err));
      });

      await Promise.all(deletePromises);
    }

    // 2. 파일 삭제 후 DB 레코드 삭제
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("전체 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}