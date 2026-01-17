import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 토큰이 설정되어 있는지 확인
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("❌ 에러: BLOB_READ_WRITE_TOKEN이 환경변수에 없습니다.");
    }

    // 1. DB에서 주소부터 확실히 가져오기
    const [rows]: any = await pool.query(
      "SELECT thumbnail, description FROM Project WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    const project = rows[0];
    const urlsToDelete: string[] = [];

    // 썸네일 추가
    if (project.thumbnail) urlsToDelete.push(project.thumbnail);

    // 본문 내 이미지들 추출
    const urlRegex = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^"'\s>]+/g;
    const matches = project.description?.match(urlRegex) || [];
    matches.forEach((url: string) => urlsToDelete.push(url));

    console.log("📍 삭제를 시도할 최종 주소 목록:", urlsToDelete);

    // 2. Vercel Storage에서 파일 삭제 (순차적으로 실행)
    for (const url of urlsToDelete) {
      try {
        await del(url, { token });
        console.log("✅ 스토리지 삭제 성공:", url);
      } catch (err: any) {
        console.error("❌ 스토리지 삭제 실패:", url, err.message);
      }
    }

    // 3. 파일 삭제 시도 후에만 DB 삭제를 수행합니다.
    await pool.query("DELETE FROM Project WHERE id = ?", [id]);
    console.log("🗑️ DB 레코드 삭제 완료 (ID:", id, ")");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🚨 서버 전체 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 💡 [수정됨] 노출 여부 수정을 위한 PUT 함수 ---
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 1. ShowInAll 토글 요청이 온 경우
    if (body.showInAll !== undefined) {
      await pool.query(
        "UPDATE Project SET showInAll = ? WHERE id = ?",
        [body.showInAll, id]
      );
      return NextResponse.json({ success: true });
    }

    // 2. Visible 토글 요청이 온 경우
    if (body.isVisible !== undefined) {
      await pool.query(
        "UPDATE Project SET isVisible = ? WHERE id = ?",
        [body.isVisible, id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  } catch (error: any) {
    console.error("🚨 PUT 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}