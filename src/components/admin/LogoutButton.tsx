"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react"; // 1. signOut 가져오기

interface LogoutButtonProps {
  variant?: "sidebar" | "dashboard";
}

export default function LogoutButton({ variant = "dashboard" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("정말 로그아웃 하시겠습니까?")) return;

    try {
      // 2. Auth.js 전용 로그아웃 함수 호출
      // 이 함수가 세션 쿠키를 지우고 자동으로 리다이렉트까지 처리합니다.
      await signOut({ 
        callbackUrl: "/login", // 로그아웃 후 이동할 페이지
        redirect: true 
      });
      
      // 3. 만약의 잔재를 위해 기존 쿠키 삭제 로직은 유지해도 좋습니다.
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // UI 로직은 그대로 유지 (변경 없음)
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