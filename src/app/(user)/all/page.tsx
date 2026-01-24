"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";
import { Heart, MessageCircle, Search } from "lucide-react";

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4 p-6 rounded-3xl">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin shadow-sm"></div>
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

  const filteredProjects = projects.filter((project) => {
    const isVisible = Number(project.isVisible) !== 0;
    const categoryVisible = Number(project.categoryIsVisible) !== 0;
    const showInAll = Number(project.showInAll) !== 0;
    if (!isVisible || !categoryVisible) return false;
    if (categoryParam === "all") return showInAll;
    return true;
  });

  useEffect(() => {
    if (!loading && hasMore && projects.length > 0 && filteredProjects.length < 6) {
      fetchProjects(false);
    }
  }, [filteredProjects.length, hasMore, loading, fetchProjects, projects.length]);

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
    /* 💡 pt-20을 적용하여 상단 여백을 더 확보했습니다. */
    <main className="max-w-7xl mx-auto px-6 pt-20 pb-10 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      
      {loading && <LoadingOverlay />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-zinc-50">
          {categoryParam === "all" ? "All Works" : categoryParam}
        </h1>

        <div className="relative w-full md:w-72">
          <div className="relative flex items-center">
            <Search 
              size={18} 
              className="absolute left-4 text-zinc-900 dark:text-zinc-400 stroke-[2.5px]" 
            />
            <input
              type="text"
              placeholder="검색어를 입력해주세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-10 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(""); setActiveSearch(""); }}
                className="absolute right-4 w-4.5 h-4.5 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <span className="text-[10px]">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <Link 
            href={`/projects/${project.id}`} 
            key={`${project.id}-${index}`} 
            className="group block border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 transition-all"
          >
            <div className="relative aspect-video bg-slate-50 dark:bg-zinc-800 overflow-hidden">
              {project.thumbnail && <Image src={project.thumbnail} alt={project.title} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold bg-black dark:bg-zinc-50 text-white dark:text-zinc-950 px-2 py-0.5 rounded-full uppercase transition-colors">
                  {project.categoryName || "Mixed"}
                </span>
                
                <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Heart size={12} className={project.likeCount > 0 ? "text-red-500 fill-red-500" : ""} />
                    <span className="text-[11px] font-bold">{project.likeCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    <span className="text-[11px] font-bold">{project.commentCount || 0}</span>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mt-1 mb-2 uppercase line-clamp-1 text-zinc-900 dark:text-zinc-100">
                {project.title}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm line-clamp-2 opacity-80 leading-relaxed">
                {cleanDescription(project.description)}
              </p>
            </div>
          </Link>
        ))}

        {hasMore && loading && [...Array(projects.length === 0 ? 6 : 3)].map((_, i) => (
          <div key={`sk-${i}`} className="border border-slate-50 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 opacity-40">
            <Skeleton className="aspect-video w-full rounded-none dark:bg-zinc-800" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-12 rounded-full dark:bg-zinc-800" />
              <Skeleton className="h-6 w-3/4 dark:bg-zinc-800" />
              <Skeleton className="h-3 w-full dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredProjects.length === 0 && (
        <div className="py-24 text-center text-slate-300 dark:text-zinc-700 font-bold uppercase tracking-widest border border-dashed border-slate-100 dark:border-zinc-800 rounded-3xl">
          No Results Found
        </div>
      )}

      <div ref={observerTarget} className="h-20" />
    </main>
  );
}