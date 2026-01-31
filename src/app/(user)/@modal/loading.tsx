// src/app/projects/[id]/loading.tsx (경로에 맞게 위치)
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 배경 Dimm을 먼저 즉시 띄움 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* 중앙 로딩 스피너 */}
      <div className="relative z-[110] flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}