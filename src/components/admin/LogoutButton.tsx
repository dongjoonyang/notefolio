"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  variant?: "sidebar" | "dashboard";
  hideText?: boolean;
}

export default function LogoutButton({ variant = "dashboard", hideText }: LogoutButtonProps) {
  const handleLogout = async () => {
    if (!confirm("정말 로그아웃 하시겠습니까?")) return;
    try {
      await signOut({ callbackUrl: "/login", redirect: true });
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  if (variant === "sidebar") {
    return (
      <button 
        onClick={handleLogout}
        className={`text-red-400 flex items-center transition-colors w-full cursor-pointer hover:text-red-300 ${
          hideText ? "justify-center" : "gap-3 px-4"
        }`}
        title={hideText ? "로그아웃" : ""}
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          <LogOut size={20} />
        </div>
        {!hideText && <span className="text-sm font-medium">로그아웃</span>}
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