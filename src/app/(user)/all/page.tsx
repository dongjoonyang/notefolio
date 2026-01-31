"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";
import { Heart, Eye, Search } from "lucide-react";
import { toggleProjectLike } from '@/lib/actions';

function ProjectSkeleton() {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden aspect-[4/3] w-full rounded-lg bg-zinc-100 dark:bg-zinc-900 
        after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] 
        after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent dark:after:via-white/5">
        <Skeleton className="w-full h-full opacity-0" />
      </div>
      <div className="flex justify-between items-center px-1">
        <div className="h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-900"></div>
        <div className="h-4 w-1/4 rounded bg-zinc-100 dark:bg-zinc-900"></div>
      </div>
    </div>
  );
}

export default function AllPostsPage() {
  return <Suspense fallback={null}><ProjectListContent /></Suspense>;
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
  
  // 💡 [핵심] 중복 호출을 물리적으로 차단하는 플래그
  const isFetching = useRef(false);

  const fetchProjects = useCallback(async (isReset = false) => {
    // 💡 이미 데이터를 가져오는 중이면 절대로 다시 실행하지 않음
    if (isFetching.current) return;
    if (!isReset && !hasMore) return;

    isFetching.current = true;
    setLoading(true);
    
    const targetPage = isReset ? 1 : page;
    if (isReset) setProjects([]); 

    try {
      const response = await fetch(
        `/api/projects?page=${targetPage}&limit=6&search=${activeSearch}&category=${categoryParam}&v=${Date.now()}`
      );

      if (!response.ok) {
        setHasMore(false);
        return;
      }

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
        setPage(prev => prev + 1);
      }
      // 데이터가 limit(6)보다 적으면 더 이상 데이터가 없는 것으로 판단
      setHasMore(newData.length === 6);
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetching.current = false; // 💡 요청이 완전히 끝난 후 잠금 해제
    }
  }, [page, activeSearch, categoryParam, hasMore]);

  // 1. 카테고리/검색 변경 시 초기화 로드
  useEffect(() => {
    setHasMore(true);
    setPage(1);
    fetchProjects(true);
  }, [categoryParam, activeSearch]); // fetchProjects를 제외하여 무한 루프 방지

  // 2. 무한 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetching.current) {
          fetchProjects(false);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProjects]);

  const handleLike = async (e: React.MouseEvent, projectId: number) => {
    e.preventDefault(); e.stopPropagation();
    const res = await toggleProjectLike(projectId);
    if (res?.success) {
      setProjects(prev => prev.map(p => p.id === projectId ? { 
        ...p, isLiked: res.action === 'liked', 
        likeCount: res.action === 'liked' ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1)
      } : p));
    }
  };

  return (
    <main className="w-full px-[4%] md:px-[5%] pt-12 pb-10 min-h-screen bg-white dark:bg-zinc-950">
      <style jsx global>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>

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
        {projects.length === 0 && loading ? (
          [...Array(6)].map((_, i) => <ProjectSkeleton key={i} />)
        ) : (
          <>
            {projects.map((project, index) => (
              <Link href={`/projects/${project.id}`} key={`${project.id}-${index}`} className="group block animate-in fade-in duration-700 slide-in-from-bottom-2">
                <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-5">
                  {project.thumbnail && <Image src={project.thumbnail} alt={project.title} fill sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5 text-white font-bold uppercase">
                    <div className="flex justify-end">
                      <button onClick={(e) => handleLike(e, project.id)} className="z-10 active:scale-90 transition-transform">
                        <Heart size={20} className={project.isLiked ? 'text-red-500 fill-red-500' : 'text-white fill-none'} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between text-sm font-bold uppercase">
                      <span className="line-clamp-1">{project.categoryName}</span>
                      <span className="text-[13px]">{project.createdAt && new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tighter">{project.title}</h2>
                  <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 font-bold">
                    <div className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => handleLike(e, project.id)}>
                      <Heart size={14} className={project.isLiked ? "text-red-500 fill-red-500" : ""} />
                      <span className="text-xs">{project.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5"><Eye size={14} /><span className="text-xs">{project.views}</span></div>
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