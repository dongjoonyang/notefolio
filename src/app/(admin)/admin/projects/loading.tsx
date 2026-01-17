export default function AdminProjectsLoading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 애니메이션 (CSS로 구현) */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Data...</p>
      </div>
    </div>
  );
}