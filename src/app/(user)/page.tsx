export const dynamic = 'force-dynamic';

import Link from "next/link";
import { recordVisit } from "@/lib/visitor";
import { redirect } from "next/navigation"; // 👈 추가

export default async function IntroPage() {
  // 1. 서버에서 방문 기록을 먼저 수행합니다.
  await recordVisit();

  // 2. 기록 후 즉시 /all 페이지로 보냅니다. 
  // 디자인 코드보다 위에 배치해서 깜빡임을 최소화합니다.
  redirect("/all");

  // 💡 아래 디자인 코드는 그대로 보존됩니다. 
  // 나중에 인트로를 쓰고 싶을 때 위의 redirect("/all")만 지우거나 주석처리 하세요.
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