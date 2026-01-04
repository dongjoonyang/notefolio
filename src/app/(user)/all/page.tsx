export const dynamic = 'force-dynamic';
"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Skeleton from "@/components/Skeleton";

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

  // ✅ HTML 태그와 &nbsp; 등을 제거하는 텍스트 정제 함수
  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, "") // 모든 HTML 태그 제거
      .replace(/&nbsp;/g, " ")   // &nbsp;를 일반 공백으로 치환
      .replace(/&amp;/g, "&")    // &amp; 등을 일반 문자로 치환
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")      // 연속된 공백을 하나로 합침
      .trim();                   // 앞뒤 공백 제거
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
    <main className="max-w-7xl mx-auto p-10 min-h-screen bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">
          {categoryParam === "all" ? "Archive" : categoryParam}
        </h1>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search & Press Enter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-5 py-3 pr-10 rounded-2xl border border-slate-200 bg-gray-50/50 text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(""); setActiveSearch(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            >✕</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Link href={`/projects/${project.id}`} key={`${project.id}-${index}`} className="group block border border-slate-100 rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
            <div className="relative aspect-video bg-slate-50 overflow-hidden">
              {project.thumbnail && <Image src={project.thumbnail} alt={project.title} fill sizes="33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
            </div>
            <div className="p-6">
              <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full uppercase">{project.categoryName || "Mixed"}</span>
              <h2 className="text-xl font-bold mt-3 mb-2 uppercase line-clamp-1">{project.title}</h2>
              {/* ✅ 수정한 부분: cleanDescription 함수 적용 */}
              <p className="text-slate-500 text-sm line-clamp-2 opacity-80 leading-relaxed">
                {cleanDescription(project.description)}
              </p>
            </div>
          </Link>
        ))}

        {hasMore && (loading || projects.length === 0) && [...Array(projects.length === 0 ? 6 : 3)].map((_, i) => (
          <div key={`sk-${i}`} className="border border-slate-50 rounded-3xl overflow-hidden bg-white shadow-sm opacity-40">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>

      {!loading && projects.length === 0 && (
        <div className="py-24 text-center text-slate-300 font-bold uppercase tracking-widest border border-dashed border-slate-100 rounded-3xl">No Results Found</div>
      )}

      <div ref={observerTarget} className="h-20" />
    </main>
  );
}