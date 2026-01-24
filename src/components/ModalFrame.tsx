'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

export default function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams(); 
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  // 💡 중복 업데이트 방지를 위한 잠금 장치
  const isInternalClick = useRef(false);

  const syncLikeState = useCallback(() => {
    // 내가 직접 클릭 중일 때는 Observer가 상태를 건드리지 못하게 방어
    if (isInternalClick.current) return;

    const innerLikeButton = document.querySelector('.inner-like-btn button:first-of-type');
    if (innerLikeButton) {
      const htmlContent = innerLikeButton.innerHTML;
      const hasFill = htmlContent.includes('fill="currentColor"') && !htmlContent.includes('fill="none"');
      const hasRedClass = innerLikeButton.classList.contains('text-red-500') || innerLikeButton.classList.contains('bg-red-500');
      
      setIsLiked(!!(hasFill || hasRedClass));
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    let observer: MutationObserver | null = null;
    const checkExist = setInterval(() => {
      const targetNode = document.querySelector('.inner-like-btn');
      if (targetNode) {
        syncLikeState();
        observer = new MutationObserver(syncLikeState);
        observer.observe(targetNode, { attributes: true, childList: true, subtree: true });
        clearInterval(checkExist);
      }
    }, 100);

    const timeout = setTimeout(() => clearInterval(checkExist), 5000);

    return () => {
      document.body.style.overflow = 'auto';
      if (observer) observer.disconnect();
      clearInterval(checkExist);
      clearTimeout(timeout);
    };
  }, [params?.id, syncLikeState]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const innerLikeButton = document.querySelector('.inner-like-btn button:first-of-type') as HTMLElement;
    
    if (innerLikeButton) {
      // ✨ 1. 잠금 시작: Observer가 syncLikeState를 실행하지 못하게 함
      isInternalClick.current = true;
      
      // ✨ 2. 즉시 UI 반영 (Optimistic Update)
      setIsLiked(prev => !prev); 
      
      // ✨ 3. 실제 버튼 클릭
      innerLikeButton.click();

      // ✨ 4. 잠시 후 잠금 해제 (상태가 안정화된 후)
      setTimeout(() => {
        isInternalClick.current = false;
        // 최종적으로 내부 상태와 일치하는지 한 번 더 확인 (검증)
        syncLikeState();
      }, 500);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const innerShareButton = document.querySelector('.inner-like-btn button:last-of-type') as HTMLElement;
    if (innerShareButton) {
      innerShareButton.click();
    }
  };

  const halfPopupWidth = '512px'; 
  const gap = '20px';

  return (
    <div className="fixed inset-0 z-[100]">
      <div 
        ref={scrollRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm overflow-y-scroll scrollbar-hide"
        onClick={() => router.back()}
      >
        <div className="flex justify-center items-start min-h-screen py-10 sm:py-20 px-4 pointer-events-none">
          <div 
            className="relative w-full max-w-5xl pointer-events-auto animate-in fade-in slide-in-from-bottom-10 duration-500 bg-white dark:bg-zinc-950 sm:rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} 
          >
            {children}
          </div>
        </div>
      </div>

      <div 
        className="hidden lg:flex fixed top-10 z-[150] flex-col gap-4"
        style={{ left: `calc(50% + ${halfPopupWidth} + ${gap})` }}
      >
        <button onClick={(e) => { e.stopPropagation(); router.back(); }} className="text-white/40 hover:text-white transition-colors p-2 self-start">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <button 
          onClick={handleLikeToggle}
          className={`group p-4 rounded-full transition-all duration-200 backdrop-blur-md border shadow-lg ${
            isLiked 
            ? 'bg-red-500 border-red-400 text-white' 
            : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <svg 
            width="24" height="24" 
            viewBox="0 0 24 24" 
            fill={isLiked ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2" 
            className={`transition-transform duration-200 ${isLiked ? 'scale-110' : 'scale-100'}`}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <button 
          onClick={handleShareClick}
          className="group p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md border border-white/10 shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60 hover:text-blue-400">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); scrollToTop(); }}
        className="hidden lg:flex fixed bottom-10 z-[150] text-white/40 hover:text-white transition-all p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10 shadow-lg"
        style={{ left: `calc(50% + ${halfPopupWidth} + ${gap})` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
      </button>
    </div>
  );
}