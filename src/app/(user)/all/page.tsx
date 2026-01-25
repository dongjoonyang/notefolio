"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";
import { Heart, Eye, Search } from "lucide-react";
// 💡 상세페이지에서 사용하는 Server Action 임포트
import { toggleProjectLike, getLikeStatus } from '@/lib/actions';

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

  // 💡 [수정됨] 첫 클릭부터 즉시 반영되도록 로직 개선
  const handleLike = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 1. 서버 액션 호출
    const res = await toggleProjectLike(projectId);
    
    if (res && res.success) {
      // 2. 서버가 알려준 action('liked' 또는 'unliked')을 기준으로 상태 업데이트
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const isNowLiked = res.action === 'liked';
          return { 
            ...p, 
            // undefined 방지를 위해 기본값 0 설정 후 가감
            likeCount: isNowLiked ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1),
            isLiked: isNowLiked
          };
        }
        return p;
      }));
    }
  };

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
    <main className="w-full px-[4%] md:px-[5%] pt-12 pb-10 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      
      {loading && <LoadingOverlay />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-zinc-50">
          {categoryParam === "all" ? "All Works" : categoryParam}
        </h1>

        <div className="relative w-full md:w-64">
          <div className="relative flex items-center">
            <Search 
              size={16} 
              className="absolute left-4 text-zinc-400 dark:text-zinc-500 stroke-[2.5px]" 
            />
            <input
              type="text"
              placeholder="검색어를 입력해주세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-10 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 focus:border-zinc-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12">
        {filteredProjects.map((project, index) => (
          <Link 
            href={`/projects/${project.id}`} 
            key={`${project.id}-${index}`} 
            className="group block"
          >
            <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-5">
              {project.thumbnail && (
                <Image 
                  src={project.thumbnail} 
                  alt={project.title} 
                  fill 
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw" 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                <div className="flex justify-end">
                  <button 
                    onClick={(e) => handleLike(e, project.id)}
                    className="transition-all active:scale-90"
                  >
                    <Heart 
                      size={20} 
                      className={`transition-colors ${project.isLiked ? 'text-red-500 fill-red-500' : 'text-white fill-none'}`} 
                    />
                  </button>
                </div>
                
                <div className="flex items-end justify-between">
                  <span className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">
                    {project.categoryName || "Mixed"}
                  </span>
                  <span className="text-[11px] text-white/80 font-medium">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex-1 pr-6">
                <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1 uppercase tracking-tighter">
                  {project.title}
                </h2>
              </div>
              
              <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Heart 
                    size={14} 
                    className={project.isLiked ? "text-red-500 fill-red-500" : ""} 
                  />
                  <span className="text-xs font-bold">{project.likeCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={14} />
                  <span className="text-xs font-bold">{project.views || 0}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {hasMore && loading && [...Array(8)].map((_, i) => (
          <div key={`sk-${i}`} className="space-y-5">
            <Skeleton className="aspect-[4/3] w-full rounded-lg dark:bg-zinc-900" />
            <div className="flex justify-between items-center px-1">
              <Skeleton className="h-4 w-1/2 rounded dark:bg-zinc-900" />
              <Skeleton className="h-4 w-1/4 rounded dark:bg-zinc-900" />
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