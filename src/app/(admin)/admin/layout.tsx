"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Tag, ListOrdered, Menu, X } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 페이지 이동 시 사이드바 닫기 (모바일용)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // 💡 배포 환경에서 document.cookie를 읽지 못해 발생하는 무한 리다이렉트 문제를 해결하기 위해 
  // 클라이언트 측 쿠키 체크 로직을 제거했습니다. 
  // 실제 권한 체크는 이미 middleware.ts(서버 사이드)에서 안전하게 처리되고 있습니다.

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      
      {/* 📱 모바일 상단 바 (Desktop hidden) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-[60]">
        <h2 className="text-lg font-bold text-blue-400">Admin</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📂 사이드바 (데스크톱 고정 / 모바일 슬라이드) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[50] w-52 bg-slate-900 text-white p-6 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:sticky lg:h-screen
      `}>
        <h2 className="text-xl font-bold mb-10 text-blue-400 hidden lg:block">Admin Panel</h2>
        
        <nav className="flex-1 space-y-4 text-sm mt-12 lg:mt-0">
          <Link href="/admin" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity py-2">
            <LayoutDashboard size={20} /> <span>대시보드</span>
          </Link>
          
          <Link href="/admin/categories" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity py-2">
            <Tag size={20} /> <span>카테고리 관리</span>
          </Link>
          
          <Link href="/admin/projects" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity py-2">
            <FolderKanban size={20} /> <span>프로젝트 관리</span>
          </Link>

          <Link href="/admin/reorder" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity py-2">
            <ListOrdered size={20} /> <span>순서 관리</span>
          </Link>
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="pt-6 border-t border-slate-800">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* 🌑 모바일 배경 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 메인 콘텐츠 영역 (모바일 여백 추가) */}
      <main className="flex-1 lg:ml-0 p-6 md:p-10 pt-24 lg:pt-10">
        {children}
      </main>
    </div>
  );
}