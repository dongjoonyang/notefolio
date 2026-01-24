'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export default function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams(); 
  const [isLiked, setIsLiked] = useState(false);
  const [projectTitle, setProjectTitle] = useState(""); 
  
  const isInternalClick = useRef(false);
  const lastKnownState = useRef(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // 💡 이전 스크롤 위치 저장용 ref
  const savedScrollY = useRef(0);

  const syncStates = useCallback(() => {
    if (!isInternalClick.current) {
      const innerLikeButton = document.querySelector('.inner-like-btn button:first-of-type');
      if (innerLikeButton) {
        const htmlContent = innerLikeButton.innerHTML;
        const hasFill = htmlContent.includes('fill="currentColor"') && !htmlContent.includes('fill="none"');
        const hasRedClass = innerLikeButton.classList.contains('text-red-500') || innerLikeButton.classList.contains('bg-red-500');
        const newState = !!(hasFill || hasRedClass);
        if (newState !== lastKnownState.current) {
          lastKnownState.current = newState;
          setIsLiked(newState);
        }
      }
    }

    const headerH1 = document.querySelector('header h1');
    if (headerH1 && headerH1.textContent && projectTitle !== headerH1.textContent) {
      setProjectTitle(headerH1.textContent);
    }
  }, [projectTitle]);

  useEffect(() => {
    // 1. 💡 모달이 열릴 때 현재 메인 페이지 스크롤 위치 저장
    savedScrollY.current = window.scrollY;
    
    // 2. 💡 모달 콘텐츠를 위해 스크롤을 최상단으로 이동 (브라우저 스크롤 사용을 위해)
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);

    let observer: MutationObserver | null = null;
    const checkExist = setInterval(() => {
      const targetNode = document.querySelector('header h1') || document.querySelector('.inner-like-btn');
      if (targetNode) {
        syncStates();
        observer = new MutationObserver(syncStates);
        observer.observe(document.body, { attributes: true, childList: true, subtree: true });
        clearInterval(checkExist);
      }
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observer) observer.disconnect();
      clearInterval(checkExist);
      
      // 3. 💡 모달이 닫힐 때 원래 위치로 부드럽게 복원
      window.scrollTo({
        top: savedScrollY.current,
        behavior: 'instant' // 'smooth'로 변경 가능하지만 보통 즉시 복원이 자연스럽습니다.
      });
    };
  }, [syncStates]);

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const innerLikeButton = document.querySelector('.inner-like-btn button:first-of-type') as HTMLElement;
    if (innerLikeButton) {
      isInternalClick.current = true;
      const nextState = !isLiked;
      setIsLiked(nextState); 
      lastKnownState.current = nextState;
      innerLikeButton.click();
      setTimeout(() => {
        isInternalClick.current = false;
        syncStates();
      }, 1000); 
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const innerShareButton = document.querySelector('.inner-like-btn button:last-of-type') as HTMLElement;
    if (innerShareButton) {
      innerShareButton.click();
      toast.success('링크가 클립보드에 복사되었습니다.', { duration: 1500 });
    }
  };

  const halfPopupWidth = '512px'; 
  const gap = '20px';

  return (
    // 💡 브라우저 스크롤을 쓰기 위해 absolute inset-0 유지
    <div className="absolute inset-0 z-[100] min-h-screen bg-white dark:bg-zinc-950 lg:bg-transparent">
      
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-[170] h-14 flex items-center px-4 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm' : 'bg-transparent'
      }`}>
        <button 
          onClick={() => router.back()}
          className={`p-1.5 rounded-full transition-all ${
            isScrolled ? 'text-zinc-900 dark:text-white' : 'bg-black/20 text-white backdrop-blur-md'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className={`flex-1 text-center px-4 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <span className="text-sm font-bold truncate block max-w-[180px] mx-auto text-zinc-900 dark:text-white">{projectTitle}</span>
        </div>
        <div className="w-8" />
      </div>

      <div 
        className="min-h-screen w-full bg-black/80 lg:backdrop-blur-sm flex justify-center items-start pt-0 lg:pt-20 lg:pb-20 px-0 lg:px-4"
        onClick={() => router.back()}
      >
        <div 
          className="relative w-full max-w-5xl bg-white dark:bg-zinc-950 lg:rounded-3xl shadow-2xl overflow-hidden min-h-screen lg:min-h-0"
          onClick={(e) => e.stopPropagation()} 
        >
          {children}
        </div>
      </div>

      <div 
        className="hidden lg:flex fixed top-10 z-[150] flex-col gap-4"
        style={{ left: `calc(50% + ${halfPopupWidth} + ${gap})` }}
      >
        <button onClick={() => router.back()} className="text-white/40 hover:text-white p-2 self-start"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        <button onClick={handleLikeToggle} className={`p-4 rounded-full border shadow-lg transition-all ${isLiked ? 'bg-red-500 border-red-400 text-white' : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <button onClick={handleShareClick} className="p-4 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 shadow-lg text-white/60 hover:text-blue-400"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></button>
      </div>
    </div>
  );
}