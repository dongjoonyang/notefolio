"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";
import { Heart, Eye, Search } from "lucide-react";
import { toggleProjectLike } from '@/lib/actions';

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

  const handleLike = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const res = await toggleProjectLike(projectId);
    
    if (res && res.success) {
      setProjects(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map(p => {
          if (p.id === projectId) {
            const isNowLiked = res.action === 'liked';
            return { 
              ...p, 
              likeCount: isNowLiked ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1),
              isLiked: isNowLiked
            };
          }
          return p;
        });
      });
    }
  };

  const fetchProjects = useCallback(async (isReset = false) => {
    if (loading || (!hasMore && !isReset)) return;
    setLoading(true);
    const targetPage = isReset ? 1 : page;
    
    try {
      const response = await fetch(
        `/api/projects?page=${targetPage}&limit=6&search=${activeSearch}&category=${categoryParam}&v=${Date.now()}`
      );
      
      if (!response.ok) {
        setHasMore(false); // 💡 서버 에러 시 무한 루프 차단
        return;
      }

      const data = await response.json();
      const newData = Array.isArray(data) ? data : [];
      
      if (isReset) {
        setProjects(newData);
        setPage(2);
      } else {
        setProjects(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const uniqueNewData = newData.filter((n: any) => !safePrev.some(p => p.id === n.id));
          return [...safePrev, ...uniqueNewData];
        });
        setPage(p => p + 1);
      }
      setHasMore(newData.length === 6);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch, categoryParam, loading, hasMore]);

  // 카테고리/검색 변경 시 리셋
  useEffect(() => {
    setHasMore(true);
    fetchProjects(true);
  }, [categoryParam, activeSearch]);

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((project) => {
    const isVisible = Number(project.isVisible) !== 0;
    const categoryVisible = Number(project.categoryIsVisible) !== 0;
    const showInAll = Number(project.showInAll) !== 0;
    if (!isVisible || !categoryVisible) return false;
    if (categoryParam === "all") return showInAll;
    return true;
  });

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
      {loading && projects.length === 0 && <LoadingOverlay />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-zinc-50">
          {categoryParam === "all" ? "All Works" : categoryParam}
        </h1>
        <div className="relative w-full md:w-64">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-4 text-zinc-400 dark:text-zinc-500 stroke-[2.5px]" />
            <input
              type="text"
              placeholder="검색어를 입력해주세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setActiveSearch(searchTerm)}
              className="w-full pl-11 pr-10 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium outline-none transition-all focus:border-zinc-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12">
        {filteredProjects.map((project, index) => (
          <Link href={`/projects/${project.id}`} key={`${project.id}-${index}`} className="group block">
            <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-5">
              {project.thumbnail && (
                <Image src={project.thumbnail} alt={project.title} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                <div className="flex justify-end">
                  <button onClick={(e) => handleLike(e, project.id)} className="z-10 active:scale-90 transition-transform p-1">
                    <Heart size={20} className={project.isLiked ? 'text-red-500 fill-red-500' : 'text-white fill-none'} />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-sm font-bold text-white uppercase line-clamp-1">{project.categoryName || "Mixed"}</span>
                  <span className="text-[13px] text-white/90 font-bold tracking-tight">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tighter">{project.title}</h2>
              <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 font-bold">
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => handleLike(e, project.id)}>
                  <Heart size={14} className={project.isLiked ? "text-red-500 fill-red-500" : ""} />
                  <span className="text-xs">{project.likeCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5"><Eye size={14} /><span className="text-xs">{project.views || 0}</span></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div ref={observerTarget} className="h-20" />
    </main>
  );
}