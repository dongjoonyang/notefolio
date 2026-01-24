"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Tag, ListOrdered, Menu, Pin, PinOff } from "lucide-react"; // 핀 아이콘 추가
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false); // 💡 명칭을 isCollapsed에서 isPinned(고정됨)로 변경
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // 💡 고정되어 있거나, 마우스를 올렸을 때만 펼쳐진 상태
  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      
      {/* 📱 모바일 상단 바 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-6 z-[60]">
        <h2 className="text-lg font-bold text-blue-400">Admin</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* 📂 사이드바 */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-[50] bg-slate-900 text-white p-4 flex flex-col transition-all duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? "translate-x-0 w-60" : "-translate-x-full lg:translate-x-0"}
          ${!isSidebarOpen && (isExpanded ? "lg:w-60" : "lg:w-20")}
          lg:sticky lg:h-screen
        `}
      >
        {/* 상단 헤더 및 고정 버튼 */}
        <div className={`flex items-center mb-10 h-10 ${!isExpanded ? "justify-center" : "justify-between px-2"}`}>
          {isExpanded && (
            <h2 className="text-xl font-bold text-blue-400 hidden lg:block whitespace-nowrap overflow-hidden animate-in fade-in duration-500">
              Admin Panel
            </h2>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsPinned(!isPinned); // 💡 클릭 시 고정/해제 토글
            }} 
            className={`hidden lg:flex p-2 rounded-lg transition-colors ${
              isPinned ? "text-blue-400 bg-slate-800" : "text-slate-500 hover:text-white hover:bg-slate-800"
            }`}
            title={isPinned ? "고정 해제" : "메뉴 고정"}
          >
            {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 space-y-2 text-sm">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="대시보드" isExpanded={isExpanded} active={pathname === "/admin"} />
          <NavItem href="/admin/categories" icon={<Tag size={20} />} label="카테고리 관리" isExpanded={isExpanded} active={pathname === "/admin/categories"} />
          <NavItem href="/admin/projects" icon={<FolderKanban size={20} />} label="프로젝트 관리" isExpanded={isExpanded} active={pathname.startsWith("/admin/projects")} />
          <NavItem href="/admin/reorder" icon={<ListOrdered size={20} />} label="순서 관리" isExpanded={isExpanded} active={pathname === "/admin/reorder"} />
        </nav>

        <div className="border-t border-slate-800 mt-auto pt-4 flex justify-center">
          <LogoutButton variant="sidebar" hideText={!isExpanded} />
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[40] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 💡 메인 영역 */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, isExpanded, active }: { href: string; icon: React.ReactNode; label: string; isExpanded: boolean; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center py-3 rounded-xl transition-all
        ${!isExpanded ? "justify-center px-0 w-full" : "px-4 gap-4"}
        ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "opacity-80 hover:opacity-100 hover:bg-slate-800"}
      `}
    >
      <div className="shrink-0 flex items-center justify-center w-6 h-6">{icon}</div>
      <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden font-bold ${!isExpanded ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
        {label}
      </span>
    </Link>
  );
}