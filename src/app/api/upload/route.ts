import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: '파일명이 없습니다.' }, { status: 400 });
  }

  try {
    // 💡 .env.local의 토큰을 명시적으로 가져옵니다.
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      console.error("❌ 에러: BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.");
      return NextResponse.json({ error: '서버 토큰 설정 누락' }, { status: 500 });
    }

    const blob = await put(filename, request.body!, {
      access: 'public',
      token: token,
      addRandomSuffix: true, // ✨ 이 부분을 추가하세요! 파일명이 같아도 중복되지 않게 해줍니다.
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("❌ Vercel Blob 상세 에러:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}