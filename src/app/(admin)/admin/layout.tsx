"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Tag, ListOrdered, Menu, X } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      
      {/* 📱 모바일 상단 바 (높이 h-16 = 64px) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-[60]">
        <h2 className="text-lg font-bold text-blue-400">Admin</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📂 사이드바 */}
      <aside className={`
        fixed inset-y-0 left-0 z-[50] w-52 bg-slate-900 text-white p-6 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:sticky lg:h-screen
      `}>
        <h2 className="text-xl font-bold mb-10 text-blue-400 hidden lg:block text-center">Admin Panel</h2>
        
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

        <div className="pt-6 border-t border-slate-800">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* 🌑 모바일 배경 오버레이 */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[40] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 💡 메인 영역: 레이아웃 여백을 완전히 제거 (데스크톱은 0, 모바일만 헤더높이 16만큼) */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}