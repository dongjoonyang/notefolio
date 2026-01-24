'use server'

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from '@vercel/blob';
import { headers } from "next/headers";

// 1. 프로젝트 생성
export async function createProject(formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description");
  const categoryId = formData.get("categoryId");
  const thumbnail = formData.get("thumbnail");
  const isVisible = formData.get("isVisible") === "0" ? 0 : 1;
  const showInAll = formData.get("showInAll") === "0" ? 0 : 1;
  const status = formData.get("status") || "PUBLISHED"; // 💡 [추가] 상태값 가져오기 (기본값 PUBLISHED)

  try {
    // 💡 [수정] status 컬럼 추가하여 INSERT
    await pool.query(
      "INSERT INTO Project (title, description, categoryId, thumbnail, isVisible, showInAll, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, description, categoryId, thumbnail, isVisible, showInAll, status]
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
  const isVisible = formData.get("isVisible") === "0" ? 0 : 1;
  const showInAll = formData.get("showInAll") === "0" ? 0 : 1;
  const status = formData.get("status"); // 💡 [추가] 업데이트할 상태값 가져오기

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;

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

    // 💡 [수정] status 컬럼 업데이트 쿼리에 추가
    await pool.query(
      "UPDATE Project SET title = ?, description = ?, categoryId = ?, thumbnail = ?, isVisible = ?, showInAll = ?, status = ? WHERE id = ?",
      [title, description, categoryId, newThumbnail, isVisible, showInAll, status, id]
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

// --- 이하는 기존과 동일 (수정 없음) ---

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

// 4. 프로젝트 일괄 삭제
export async function deleteMultipleProjects(ids: number[]) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;

    for (const id of ids) {
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

// 5. 프로젝트 좋아요 토글
export async function toggleProjectLike(projectId: number) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  try {
    const [rows]: any = await pool.query(
      "SELECT id FROM ProjectLike WHERE projectId = ? AND ipAddress = ?",
      [projectId, ip]
    );

    if (rows && rows.length > 0) {
      await pool.query(
        "DELETE FROM ProjectLike WHERE projectId = ? AND ipAddress = ?",
        [projectId, ip]
      );
      revalidatePath(`/projects/${projectId}`);
      return { success: true, action: "unliked" };
    } else {
      await pool.query(
        "INSERT INTO ProjectLike (projectId, ipAddress) VALUES (?, ?)",
        [projectId, ip]
      );
      revalidatePath(`/projects/${projectId}`);
      return { success: true, action: "liked" };
    }
  } catch (error) {
    console.error("Like Toggle Error:", error);
    return { success: false, message: "좋아요 처리 중 오류가 발생했습니다." };
  }
}

// 6. 좋아요 상태 및 개수 가져오기
export async function getLikeStatus(projectId: number) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  try {
    const [countRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM ProjectLike WHERE projectId = ?",
      [projectId]
    );
    
    const [myLikeRows]: any = await pool.query(
      "SELECT id FROM ProjectLike WHERE projectId = ? AND ipAddress = ?",
      [projectId, ip]
    );

    return {
      count: countRows[0].count,
      isLiked: myLikeRows && myLikeRows.length > 0
    };
  } catch (error) {
    console.error("Get Like Status Error:", error);
    return { count: 0, isLiked: false };
  }
}