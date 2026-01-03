"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { FolderKanban, Users, MousePointer2 } from "lucide-react";

interface RecentProject {
  id: number;
  title: string;
  createdAt: string;
}

export default function AdminMainPage() {
  const router = useRouter();
  
  // 💡 1. API에서 보내주는 모든 데이터를 담을 수 있게 초기값 수정
  const [stats, setStats] = useState({
    totalProjects: 0,
    todayVisitors: 0,   // 추가
    totalMessages: 0,    // 추가
    recentProjects: [] as RecentProject[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          // 💡 2. 데이터 구조가 일치하므로 setStats(data)가 정상 작동합니다.
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-gray-500">포트폴리오 현황을 한눈에 확인하세요.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. 프로젝트 개수 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <FolderKanban size={20} />
            <span className="font-medium text-gray-700">프로젝트</span>
          </div>
          <p className="text-3xl font-bold">{loading ? "..." : `${stats.totalProjects}개`}</p>
        </div>

        {/* 2. 오늘 방문자 (실제 데이터 연동) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <MousePointer2 size={20} />
            <span className="font-medium text-gray-700">오늘 방문자</span>
          </div>
          <p className="text-3xl font-bold">
            {loading ? "..." : `${stats.todayVisitors ?? 0}명`}
          </p>
        </div>

        {/* 3. 문의 메시지 (실제 데이터 연동) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <Users size={20} />
            <span className="font-medium text-gray-700">문의 메시지</span>
          </div>
          <p className="text-3xl font-bold">
            {loading ? "..." : `${stats.totalMessages ?? 0}건`}
          </p>
        </div>
      </div>

      {/* 4. 최근 활동 안내 구역 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
        <h3 className="font-bold mb-4 text-gray-700">최근 등록된 프로젝트</h3>
        
        {loading ? (
          <p className="text-center text-gray-400 mt-10">데이터 로딩 중...</p>
        ) : stats.recentProjects && stats.recentProjects.length > 0 ? (
          <div className="space-y-3">
            {stats.recentProjects.map((project) => (
              <div key={project.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                <span className="font-medium">{project.title}</span>
                <span className="text-xs text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            <button 
              onClick={() => router.push('/admin/projects')}
              className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              전체 보기 →
            </button>
          </div>
        ) : (
          <div className="text-center mt-10">
            <p className="text-gray-400">최근 업데이트된 프로젝트가 없습니다.</p>
            <button 
              onClick={() => router.push('/admin/projects/new')}
              className="mt-4 text-blue-600 hover:underline font-medium"
            >
              새 프로젝트 등록하기 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}