"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";

// ✅ 로딩 오버레이 컴포넌트 (파일을 따로 만들기 번거로우시면 여기에 포함해서 쓰셔도 됩니다)
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 애니메이션 */}
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin"></div>
        <p className="text-white dark:text-zinc-100 font-bold tracking-widest uppercase text-[10px]">Loading</p>
      </div>
    </div>
  );
}

export default function AllPostsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectListContent />
    </Suspense>
  );
}

function ProjectListContent() {
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); 
  
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const observerTarget = useRef<HTMLDivElement>(null);

  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  };

  const fetchProjects = useCallback(async (isReset = false) => {
    if (loading && !isReset) return;
    
    setLoading(true);
    const targetPage = isReset ? 1 : page;
    
    try {
      const response = await fetch(
        `/api/projects?page=${targetPage}&limit=6&search=${activeSearch}&category=${categoryParam}&v=${Date.now()}`
      );
      const data = await response.json();
      
      if (isReset) {
        setProjects(data);
        setPage(2);
      } else {
        setProjects(prev => [...prev, ...data.filter((n: any) => !prev.some(p => p.id === n.id))]);
        setPage(p => p + 1);
      }
      setHasMore(data.length === 6);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, categoryParam, loading]);

  useEffect(() => {
    fetchProjects(true);
  }, [categoryParam, activeSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setActiveSearch(searchTerm);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProjects(false);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProjects]);

  return (
    <main className="max-w-7xl mx-auto p-10 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      
      {/* ✅ 로딩 중일 때 오버레이 표시 */}
      {loading && <LoadingOverlay />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-zinc-50">
          {categoryParam === "all" ? "Archive" : categoryParam}
        </h1>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search & Press Enter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-5 py-3 pr-10 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-200 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(""); setActiveSearch(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-xs"
            >✕</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Link 
            href={`/projects/${project.id}`} 
            key={`${project.id}-${index}`} 
            className="group block border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 hover:shadow-lg dark:hover:shadow-zinc-900/50 transition-all"
          >
            <div className="relative aspect-video bg-slate-50 dark:bg-zinc-800 overflow-hidden">
              {project.thumbnail && <Image src={project.thumbnail} alt={project.title} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
            </div>
            <div className="p-6">
              <span className="text-[10px] font-bold bg-black dark:bg-zinc-50 text-white dark:text-zinc-950 px-2 py-0.5 rounded-full uppercase transition-colors">
                {project.categoryName || "Mixed"}
              </span>
              <h2 className="text-xl font-bold mt-3 mb-2 uppercase line-clamp-1 text-zinc-900 dark:text-zinc-100">
                {project.title}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm line-clamp-2 opacity-80 leading-relaxed">
                {cleanDescription(project.description)}
              </p>
            </div>
          </Link>
        ))}

        {/* 기존 스켈레톤 UI도 유지 (오버레이와 함께 쓰면 더 자연스럽습니다) */}
        {hasMore && (loading || projects.length === 0) && [...Array(projects.length === 0 ? 6 : 3)].map((_, i) => (
          <div key={`sk-${i}`} className="border border-slate-50 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm opacity-40">
            <Skeleton className="aspect-video w-full rounded-none dark:bg-zinc-800" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-12 rounded-full dark:bg-zinc-800" />
              <Skeleton className="h-6 w-3/4 dark:bg-zinc-800" />
              <Skeleton className="h-3 w-full dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className="py-24 text-center text-slate-300 dark:text-zinc-700 font-bold uppercase tracking-widest border border-dashed border-slate-100 dark:border-zinc-800 rounded-3xl">
          No Results Found
        </div>
      )}

      <div ref={observerTarget} className="h-20" />
    </main>
  );
}