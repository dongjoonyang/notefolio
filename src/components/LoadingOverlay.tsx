// components/LoadingOverlay.tsx
'use client';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center gap-4">
        {/* 테두리가 도는 스피너 */}
        <div className="w-12 h-12 border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin"></div>
        <p className="text-white dark:text-zinc-100 font-medium tracking-widest uppercase text-xs">Loading</p>
      </div>
    </div>
  );
}