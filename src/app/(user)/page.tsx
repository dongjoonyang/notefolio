// src/app/page.tsx
import Link from "next/link";
import { recordVisit } from "@/lib/visitor"; // 👈 방문 기록 함수 불러오기

export default async function IntroPage() {
  // 💡 서버 컴포넌트이므로 페이지가 로드될 때 서버에서 즉시 실행됩니다.
  await recordVisit();

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <h1 className="text-6xl font-black tracking-tighter mb-6">
        Welcome to Behance.
      </h1>
      <p className="text-xl text-gray-500 max-w-xl mb-10 leading-relaxed">
        창의적인 아이디어와 프로젝트를 공유하는 공간입니다.
      </p>
      <Link 
        href="/all" 
        className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all"
      >
        모든 글 보러가기 →
      </Link>
    </main>
  );
}