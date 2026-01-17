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

  // 💡 [수정] 무한 루프 및 중복 호출 해결
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const hasAdminCookie = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("is_admin="));

      if (!hasAdminCookie) {
        console.log("관리자 권한 만료 감지: 로그인 페이지로 이동합니다.");
        router.push("/login"); 
      }
    };

    // 1. 실행 즉시 1회 체크
    checkAuthAndRedirect();
    
    // 2. 인터벌 생성
    const intervalId = setInterval(checkAuthAndRedirect, 2000);
    
    // 3. [핵심] Cleanup 함수: 다음 useEffect가 실행되기 전이나 
    // 컴포넌트가 사라질 때 기존 인터벌을 완전히 제거합니다.
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    
    // router와 pathname을 의존성에 넣어 변경 시마다 기존 것을 청소하고 새로 시작하게 합니다.
  }, [router, pathname]);

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