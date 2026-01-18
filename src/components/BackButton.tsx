'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  categoryName?: string; // 카테고리 이름을 받을 수 있게 추가
}

export default function BackButton({ categoryName }: BackButtonProps) {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      // 모바일 클릭 안되는 현상을 위해 z-index와 터치 영역(p-2) 확보
      className="relative z-10 -ml-2 p-2 text-zinc-400 hover:text-zinc-900 flex items-center gap-1 mb-6 cursor-pointer transition-colors active:scale-95 group"
    >
      <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      <span className="text-sm font-bold tracking-tight">
        {categoryName ? `${categoryName} 목록으로 돌아가기` : "이전 목록으로 돌아가기"}
      </span>
    </button>
  );
}