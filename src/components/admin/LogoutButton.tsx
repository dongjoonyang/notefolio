"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "sidebar" | "dashboard";
}

export default function LogoutButton({ variant = "dashboard" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("정말 로그아웃 하시겠습니까?")) return;

    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        // 클라이언트 쿠키 강제 삭제 (보안 보조)
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 사이드바용 스타일
  if (variant === "sidebar") {
    return (
      <button 
        onClick={handleLogout}
        className="mt-auto pt-6 border-t border-slate-700 text-red-400 flex items-center gap-3 cursor-pointer hover:text-red-300 transition-colors w-full text-left"
      >
        <LogOut size={20} /> <span>로그아웃</span>
      </button>
    );
  }

  // 대시보드 상단 버튼용 스타일
  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
    >
      <LogOut size={16} />
      로그아웃
    </button>
  );
}