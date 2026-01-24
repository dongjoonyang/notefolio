'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* 배경 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={() => router.back()} />
      
      <div className="relative w-full max-w-5xl z-10 animate-in slide-in-from-bottom duration-500 ease-out">
        {/* PC 닫기 버튼 */}
        <button 
          onClick={() => router.back()}
          className="hidden sm:flex absolute -right-12 top-0 text-white/50 hover:text-white transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        {children}
      </div>
    </div>
  );
}