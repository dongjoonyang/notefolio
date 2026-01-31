"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";
import { Heart, Eye, Search } from "lucide-react";
import { toggleProjectLike } from '@/lib/actions';

// 💡 쉬머(Shimmer) 애니메이션이 적용된 스켈레톤
function ProjectSkeleton() {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden aspect-[4/3] w-full rounded-lg bg-zinc-100 dark:bg-zinc-900 
        after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] 
        after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent dark:after:via-white/5">
        <Skeleton className="w-full h-full opacity-0" />
      </div>
      <div className="flex justify-between items-center px-1">
        <div className="relative overflow-hidden h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-900
          after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] 
          after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent dark:after:via-white/5">
        </div>
        <div className="relative overflow-hidden h-4 w-1/4 rounded bg-zinc-100 dark:bg-zinc-900
          after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] 
          after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent dark:after:via-white/5">
        </div>
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
    if (res?.success) {
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const isNowLiked = res.action === 'liked';
          return { 
            ...p, 
            likeCount: isNowLiked ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1),
            isLiked: isNowLiked
          };
        }
        return p;
      }));
    }
  };

  const fetchProjects = useCallback(async (isReset = false) => {
    if (loading || (!hasMore && !isReset)) return;
    
    setLoading(true);
    if (isReset) setProjects([]); 

    const targetPage = isReset ? 1 : page;
    
    try {
      const [response] = await Promise.all([
        fetch(`/api/projects?page=${targetPage}&limit=6&search=${activeSearch}&category=${categoryParam}&v=${Date.now()}`),
        new Promise(resolve => setTimeout(resolve, 400)) // 💡 애니메이션을 충분히 보여주기 위해 약간 더 지연
      ]);

      if (!response.ok) { setHasMore(false); return; }

      const data = await response.json();
      const newData = Array.isArray(data) ? data : [];
      
      if (isReset) {
        setProjects(newData);
        setPage(2);
      } else {
        setProjects(prev => {
          const unique = newData.filter(n => !prev.some(p => p.id === n.id));
          return [...prev, ...unique];
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

  useEffect(() => {
    setHasMore(true);
    fetchProjects(true);
  }, [categoryParam, activeSearch]);

  const filteredProjects = projects.filter((p) => {
    if (Number(p.isVisible) === 0 || Number(p.categoryIsVisible) === 0) return false;
    return categoryParam === "all" ? Number(p.showInAll) !== 0 : true;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading) fetchProjects(false); },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProjects]);

  return (
    <main className="w-full px-[4%] md:px-[5%] pt-12 pb-10 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 💡 Tailwind 설정에 shimmer 애니메이션이 없다면 globals.css에 추가해야 함 */}
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-zinc-50">
          {categoryParam === "all" ? "All Works" : categoryParam}
        </h1>
        <div className="relative w-full md:w-64">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="검색어를 입력해주세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setActiveSearch(searchTerm)}
              className="w-full pl-11 pr-10 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-12">
        {loading && projects.length === 0 ? (
          [...Array(6)].map((_, i) => <ProjectSkeleton key={i} />)
        ) : (
          <>
            {filteredProjects.map((project, index) => (
              <Link 
                href={`/projects/${project.id}`} 
                key={`${project.id}-${index}`} 
                className="group block animate-in fade-in duration-700 slide-in-from-bottom-2"
              >
                <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-5">
                  {project.thumbnail && (
                    <Image src={project.thumbnail} alt={project.title} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5 text-white font-bold uppercase">
                    <div className="flex justify-end">
                      <button onClick={(e) => handleLike(e, project.id)} className="z-10 active:scale-90 transition-transform p-1">
                        <Heart size={20} className={project.isLiked ? 'text-red-500 fill-red-500' : 'text-white fill-none'} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-sm line-clamp-1">{project.categoryName}</span>
                      <span className="text-[13px]">{project.createdAt && new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tighter">{project.title}</h2>
                  <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => handleLike(e, project.id)}>
                      <Heart size={14} className={project.isLiked ? "text-red-500 fill-red-500" : ""} />
                      <span className="text-xs font-bold">{project.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5"><Eye size={14} /><span className="text-xs font-bold">{project.views}</span></div>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>

      <div ref={observerTarget} className="h-20" />
    </main>
  );
}