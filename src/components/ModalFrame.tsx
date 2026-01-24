'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // 1. 배경 목록이 움직이지 않도록 본문 스크롤을 막습니다.
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    /**
     * [구조 설명]
     * - fixed inset-0: 화면에 꽉 찬 고정 배경(Dim)을 만듭니다.
     * - overflow-y-scroll: 팝업 내부가 아니라, 이 최외곽 레이어에 스크롤을 줍니다.
     * - scrollbar-hide: 이 레이어의 스크롤바를 숨겨서 팝업만 움직이는 느낌을 냅니다.
     */
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-scroll scrollbar-hide">
      
      {/* 배경 클릭 시 닫기 (컨텐츠가 길어도 배경 전체 클릭 가능하게 absolute inset-0) */}
      <div className="absolute inset-0 -z-10 min-h-[100.1%]" onClick={() => router.back()} />
      
      {/* 컨텐츠 컨테이너: flex를 이용해 중앙에 배치하고, 
          py-20을 주어 팝업 위아래에 여백을 둡니다. 이 여백 덕분에 팝업이 이동하는 게 보입니다. */}
      <div className="flex justify-center items-start min-h-screen py-10 sm:py-20 px-4 pointer-events-none">
        
        <div className="relative w-full max-w-5xl pointer-events-auto animate-in fade-in slide-in-from-bottom-10 duration-500">
          
          {/* PC 닫기 버튼 (팝업 우측 상단 고정) */}
          <button 
            onClick={() => router.back()}
            className="hidden sm:flex absolute -right-16 top-0 text-white/40 hover:text-white transition-colors"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          {/* 💡 핵심: 여기서 주입되는 children(article)은 
              높이 제한 없이 자신의 콘텐츠만큼 아래로 길게 쭉 늘어납니다. */}
          {children}
        </div>
      </div>
    </div>
  );
}