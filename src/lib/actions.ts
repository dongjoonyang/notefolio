'use server'

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from '@vercel/blob';

// 1. 프로젝트 생성
export async function createProject(formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description");
  const categoryId = formData.get("categoryId");
  const thumbnail = formData.get("thumbnail");

  try {
    await pool.query(
      "INSERT INTO Project (title, description, categoryId, thumbnail) VALUES (?, ?, ?, ?)",
      [title, description, categoryId, thumbnail]
    );
  } catch (error) {
    console.error("Create Error:", error);
    return { message: "생성 중 오류가 발생했습니다." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/all");
  revalidatePath("/");
  redirect("/admin/projects");
}

// 2. 프로젝트 수정 (본문 이미지 비교 삭제 로직 포함)
export async function updateProject(id: number, formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId");
  const newThumbnail = formData.get("thumbnail") as string;

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    // Vercel Blob URL을 찾아내는 정규식
    const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;

    // 🔍 1. 기존 데이터 조회 (삭제 전 비교용)
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const oldProject = rows[0];

      // --- [A. 썸네일 변경 시 삭제] ---
      if (oldProject.thumbnail && oldProject.thumbnail !== newThumbnail) {
        try {
          await del(oldProject.thumbnail, { token });
          console.log("✅ 기존 썸네일 삭제 완료");
        } catch (err) {
          console.error("❌ 기존 썸네일 삭제 실패:", err);
        }
      }

      // --- [B. 본문 이미지 비교 삭제] ---
      // match 결과가 null일 수 있으므로 string[] 타입을 명시합니다.
      const oldImages: string[] = oldProject.description?.match(urlRegex) || [];
      const newImages: string[] = description?.match(urlRegex) || [];

      // 기존 리스트에는 있지만 새 리스트에는 없는 URL들만 추출
      const deletedImages = oldImages.filter((img: string) => !newImages.includes(img));

      for (const imageUrl of deletedImages) {
        try {
          await del(imageUrl, { token });
          console.log("✅ 본문에서 제거된 이미지 스토리지 정리 완료:", imageUrl);
        } catch (err) {
          console.error("❌ 본문 이미지 삭제 실패:", err);
        }
      }
    }

    // 2. DB 업데이트
    await pool.query(
      "UPDATE Project SET title = ?, description = ?, categoryId = ?, thumbnail = ? WHERE id = ?",
      [title, description, categoryId, newThumbnail, id]
    );

    // 캐시 갱신
    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/all");
    revalidatePath("/");

  } catch (error: any) {
    console.error("Update Error:", error);
    return { message: "수정 중 오류가 발생했습니다." };
  }
  
  // redirect는 try/catch 밖에서 실행
  redirect("/admin/projects");
}

// 3. 프로젝트 삭제
export async function deleteProject(id: number) {
  try {
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const project = rows[0];
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      const urlsToDelete = new Set<string>();

      if (project.thumbnail) urlsToDelete.add(project.thumbnail);

      const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;
      const matches = project.description?.match(urlRegex);
      if (matches) {
        matches.forEach((url: string) => urlsToDelete.add(url));
      }

      for (const url of Array.from(urlsToDelete)) {
        try {
          await del(url, { token });
          console.log("✅ 삭제 성공:", url);
        } catch (err) {
          console.error("❌ 삭제 실패:", err);
        }
      }
    }

    await pool.query("DELETE FROM Project WHERE id = ?", [id]);

    revalidatePath("/admin/projects");
    revalidatePath("/all");
    revalidatePath("/");

    return { success: true }; 
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
}