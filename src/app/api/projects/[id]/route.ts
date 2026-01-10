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

    // 1. DB에서 삭제할 프로젝트의 이미지 주소들을 먼저 조회합니다.
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const project = rows[0];
      const urlsToDelete = new Set<string>(); // 중복 주소 방지

      // 썸네일 주소 추가
      if (project.thumbnail && project.thumbnail.includes("public.blob.vercel-storage.com")) {
        urlsToDelete.add(project.thumbnail);
      }

      // 본문(description) HTML 태그 내에서 실제 이미지 주소만 추출
      if (project.description) {
        // 따옴표(")나 태그 기호(>) 전까지만 주소로 인식하는 정규식
        const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;
        const matches = project.description.match(urlRegex);
        if (matches) {
          matches.forEach((url: string) => urlsToDelete.add(url));
        }
      }

      // 2. Vercel Storage에서 파일들을 삭제합니다.
      const deletePromises = Array.from(urlsToDelete).map((url) => {
        console.log("🗑️ 삭제 시도:", url);
        return del(url, { token }).catch((err) => 
          console.error("❌ 파일 삭제 실패(이미 지워졌거나 주소 틀림):", url, err)
        );
      });

      await Promise.all(deletePromises);
    }

    // 3. 파일 삭제 시도 후 최종적으로 DB에서 데이터를 지웁니다.
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);
    
    return NextResponse.json({ success: true, message: "성공적으로 삭제되었습니다." });
  } catch (error: any) {
    console.error("🚨 서버 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT (수정) 함수도 필요하시다면 여기에 이어서 작성하시면 됩니다.