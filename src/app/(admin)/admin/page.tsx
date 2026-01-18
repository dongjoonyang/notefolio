"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { FolderKanban, Users, MousePointer2, Loader2, ChevronRight } from "lucide-react";

interface RecentProject {
  id: number;
  title: string;
  createdAt: string;
}

export default function AdminMainPage() {
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    todayVisitors: 0,
    totalMessages: 0,
    recentProjects: [] as RecentProject[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    /**
     * 💡 여백 최적화:
     * pt-8 md:pt-12: 너무 길었던 상단 여백을 프로젝트 관리 페이지와 유사한 수준으로 축소
     * max-w-6xl: 너비를 조금 더 넓혀서(5xl -> 6xl) 시원하게 배치
     */
    <div className="w-full pt-8 md:pt-12 px-6 md:px-8 pb-16">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* 상단 헤더 섹션 */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Dashboard</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium uppercase tracking-tight">Portfolio Overview</p>
          </div>
          <LogoutButton />
        </div>

        {/* 통계 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. 프로젝트 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <FolderKanban size={18} />
              </div>
              <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Projects</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{loading ? "..." : stats.totalProjects}</span>
              <span className="text-xs font-bold text-slate-400 ml-1">ITEMS</span>
            </div>
          </div>

          {/* 2. 오늘 방문자 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                <MousePointer2 size={18} />
              </div>
              <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Visitors</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{loading ? "..." : (stats.todayVisitors ?? 0)}</span>
              <span className="text-xs font-bold text-slate-400 ml-1">TODAY</span>
            </div>
          </div>

          {/* 3. 문의 메시지 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3 text-purple-600 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                <Users size={18} />
              </div>
              <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Messages</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{loading ? "..." : (stats.totalMessages ?? 0)}</span>
              <span className="text-xs font-bold text-slate-400 ml-1">TOTAL</span>
            </div>
          </div>
        </div>

        {/* 최근 활동 안내 구역 */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight px-1">Recent Activity</h3>
          
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="animate-spin mb-3" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest">Loading...</p>
              </div>
            ) : stats.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="flex flex-col">
                {stats.recentProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="flex justify-between items-center p-5 border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors group cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-black transition-all" />
                      <span className="font-bold text-slate-700 group-hover:text-black transition-colors text-sm">
                        {project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-black transition-all" />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => router.push('/admin/projects')}
                  className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-black hover:bg-slate-50 transition-all uppercase tracking-widest border-t border-slate-50"
                >
                  View All Projects →
                </button>
              </div>
            ) : (
              <div className="p-20 text-center">
                <p className="text-slate-400 text-sm font-medium mb-4">최근 등록된 프로젝트가 없습니다.</p>
                <button 
                  onClick={() => router.push('/admin/projects/new')}
                  className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                >
                  Add Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}