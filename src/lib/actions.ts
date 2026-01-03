'use server'

import { pool } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// 1. 프로젝트 생성
export async function createProject(formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description");
  const categoryId = formData.get("categoryId");
  const thumbnail = formData.get("thumbnail"); // ✅ 썸네일 추가

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
  redirect("/admin/projects");
}

// 2. 프로젝트 수정
export async function updateProject(id: number, formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description");
  const categoryId = formData.get("categoryId");
  const thumbnail = formData.get("thumbnail"); // ✅ 썸네일 추가

  try {
    await pool.query(
      "UPDATE Project SET title = ?, description = ?, categoryId = ?, thumbnail = ? WHERE id = ?",
      [title, description, categoryId, thumbnail, id]
    );
  } catch (error) {
    console.error("Update Error:", error);
    return { message: "수정 중 오류가 발생했습니다." };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/all");
  redirect("/admin/projects");
}

// 3. 프로젝트 삭제 (기본 코드 유지)
export async function deleteProject(id: number) {
  try {
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);
    revalidatePath("/admin/projects");
    revalidatePath("/all");
    return { success: true }; 
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
}