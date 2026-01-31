// app/(user)/projects/[id]/loading.tsx

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-zinc-950/60 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 애니메이션 */}
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}