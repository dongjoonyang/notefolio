'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export default function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [projectTitle, setProjectTitle] = useState(""); 
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isInternalClick = useRef(false);
  const lastKnownState = useRef(false);

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
    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalHtmlGutter = html.style.scrollbarGutter;
    const originalBodyGutter = body.style.scrollbarGutter;

    html.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');
    html.style.setProperty('scrollbar-gutter', 'auto', 'important');
    body.style.setProperty('scrollbar-gutter', 'auto', 'important');
    
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > 40);
      }
    };

    const scrollEl = scrollRef.current;
    scrollEl?.addEventListener('scroll', handleScroll);

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
      html.style.setProperty('overflow', originalHtmlOverflow);
      body.style.setProperty('overflow', originalBodyOverflow);
      html.style.setProperty('scrollbar-gutter', originalHtmlGutter);
      body.style.setProperty('scrollbar-gutter', originalBodyGutter);
      
      scrollEl?.removeEventListener('scroll', handleScroll);
      if (observer) observer.disconnect();
      clearInterval(checkExist);
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

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 💡 max-w-5xl (1024px)에 맞춰 절반 값인 512px로 수정
  const halfPopupWidth = '512px'; 
  const gap = '24px';

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 lg:bg-transparent transition-none">
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-[170] h-14 flex items-center px-4 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm' : 'bg-transparent'
      }`}>
        <button onClick={() => router.back()} className={`p-1.5 rounded-full transition-all ${isScrolled ? 'text-zinc-900 dark:text-white' : 'bg-black/20 text-white backdrop-blur-md'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div className={`flex-1 text-center px-4 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <span className="text-sm font-bold truncate block max-w-[180px] mx-auto text-zinc-900 dark:text-white">{projectTitle}</span>
        </div>
        <div className="w-8" />
      </div>

      <div 
        ref={scrollRef}
        className="absolute inset-0 bg-black/80 lg:backdrop-blur-sm overflow-y-scroll overscroll-contain"
        onClick={() => router.back()}
      >
        <div className="flex justify-center items-start min-h-full py-0 lg:py-20 px-0 lg:px-4 pointer-events-none">
          <div 
            className="relative w-full max-w-5xl pointer-events-auto bg-white dark:bg-zinc-950 lg:rounded-xl shadow-2xl min-h-screen lg:min-h-0 border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()} 
          >
            {children}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex fixed top-10 z-[150] flex-col gap-4" style={{ left: `calc(50% + ${halfPopupWidth} + ${gap})` }}>
        <button onClick={() => router.back()} className="text-white/40 hover:text-white p-2 self-start"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        <button onClick={handleLikeToggle} className={`p-4 rounded-full border shadow-lg transition-all ${isLiked ? 'bg-red-500 border-red-400 text-white' : 'bg-white/10 dark:bg-zinc-900/50 border-white/10 dark:border-zinc-800 text-white/60 hover:bg-white/20'}`}><svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
        <button onClick={handleShareClick} className="p-4 bg-white/10 dark:bg-zinc-900/50 hover:bg-white/20 rounded-full border border-white/10 dark:border-zinc-800 shadow-lg text-white/60 hover:text-blue-400"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></button>
        
        <button 
          onClick={scrollToTop} 
          className={`p-4 bg-white/10 dark:bg-zinc-900/50 hover:bg-white/20 rounded-full border border-white/10 dark:border-zinc-800 shadow-lg text-white/60 hover:text-white transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
}