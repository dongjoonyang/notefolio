'use server'

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from '@vercel/blob'; // ✅ 1. 상단에 이 줄을 추가하세요

// ... 1. 생성, 2. 수정 코드는 그대로 두시고 ...

// 3. 프로젝트 삭제 (수정된 코드)
export async function deleteProject(id: number) {
  try {
    // 🔍 A. 지우기 전에 DB에서 이미지 주소들을 먼저 읽어옵니다.
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const project = rows[0];
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      const urlsToDelete = new Set<string>();

      // 썸네일 주소 추가
      if (project.thumbnail) urlsToDelete.add(project.thumbnail);

      // 본문(description) 내의 모든 Vercel Blob 이미지 주소 추출
      if (project.description) {
        const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;
        const matches = project.description.match(urlRegex);
        if (matches) {
          matches.forEach((url: string) => urlsToDelete.add(url));
        }
      }

      // ☁️ B. Vercel Storage에서 실제 파일들 삭제
      for (const url of Array.from(urlsToDelete)) {
        try {
          await del(url, { token });
          console.log("✅ 스토리지 파일 삭제 성공:", url);
        } catch (err) {
          console.error("❌ 스토리지 파일 삭제 실패:", url);
        }
      }
    }

    // 🗑️ C. 파일 삭제 시도 후 최종적으로 DB 레코드 삭제
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);

    revalidatePath("/admin/projects");
    revalidatePath("/all");
    revalidatePath("/"); // 메인 페이지도 갱신

    return { success: true }; 
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
}