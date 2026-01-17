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
  // 💡 [추가] 가시성 데이터 가져오기 (기본값 1)
  const isVisible = formData.get("isVisible") === "0" ? 0 : 1;

  try {
    await pool.query(
      "INSERT INTO Project (title, description, categoryId, thumbnail, isVisible) VALUES (?, ?, ?, ?, ?)",
      [title, description, categoryId, thumbnail, isVisible]
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

// 2. 프로젝트 수정
export async function updateProject(id: number, formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId");
  const newThumbnail = formData.get("thumbnail") as string;
  // 💡 [추가] 가시성 데이터 가져오기
  const isVisible = formData.get("isVisible") === "0" ? 0 : 1;

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;

    // 🔍 1. 기존 데이터 조회
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (rows && rows.length > 0) {
      const oldProject = rows[0];

      if (oldProject.thumbnail && oldProject.thumbnail !== newThumbnail) {
        try {
          await del(oldProject.thumbnail, { token });
        } catch (err) {
          console.error("❌ 기존 썸네일 삭제 실패:", err);
        }
      }

      const oldImages: string[] = oldProject.description?.match(urlRegex) || [];
      const newImages: string[] = description?.match(urlRegex) || [];
      const deletedImages = oldImages.filter((img: string) => !newImages.includes(img));

      for (const imageUrl of deletedImages) {
        try {
          await del(imageUrl, { token });
        } catch (err) {
          console.error("❌ 본문 이미지 삭제 실패:", err);
        }
      }
    }

    // 2. DB 업데이트 (isVisible 컬럼 추가)
    await pool.query(
      "UPDATE Project SET title = ?, description = ?, categoryId = ?, thumbnail = ?, isVisible = ? WHERE id = ?",
      [title, description, categoryId, newThumbnail, isVisible, id]
    );

    revalidatePath("/admin/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/all");
    revalidatePath("/");

  } catch (error: any) {
    console.error("Update Error:", error);
    return { message: "수정 중 오류가 발생했습니다." };
  }
  
  redirect("/admin/projects");
}

// 3. 프로젝트 삭제 (기존과 동일)
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

// 4. 프로젝트 일괄 삭제 (기존 deleteProject 로직 활용)
export async function deleteMultipleProjects(ids: number[]) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;

    for (const id of ids) {
      // 각 프로젝트의 이미지/썸네일 삭제 로직 (기존 삭제 로직 재사용)
      const [rows]: any = await pool.query(
        "SELECT thumbnail, description FROM Project WHERE id = ?",
        [id]
      );

      if (rows && rows.length > 0) {
        const project = rows[0];
        const urlsToDelete = new Set<string>();
        if (project.thumbnail) urlsToDelete.add(project.thumbnail);
        const matches = project.description?.match(urlRegex);
        if (matches) matches.forEach((url: string) => urlsToDelete.add(url));

        for (const url of Array.from(urlsToDelete)) {
          try { await del(url, { token }); } catch (err) { console.error("파일 삭제 실패:", url); }
        }
      }
    }

    // DB에서 선택된 ID들 삭제
    await pool.query("DELETE FROM Project WHERE id IN (?)", [ids]);

    revalidatePath("/admin/projects");
    revalidatePath("/all");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Batch Delete Error:", error);
    return { success: false, message: "일부 프로젝트 삭제 중 오류가 발생했습니다." };
  }
}