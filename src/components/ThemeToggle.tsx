"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 서버 사이드 렌더링 시 발생하는 하이드레이션 오류를 방지하기 위해 
  // 컴포넌트가 브라우저에 마운트된 후에만 렌더링합니다.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 마운트되기 전에는 버튼 모양만 유지하는 빈 박스를 보여줍니다.
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex items-center justify-center rounded-lg w-9 h-9 transition-colors border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-100"
      aria-label="테마 변경"
    >
      {/* Sun 아이콘: 라이트 모드일 때 나타남 */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      
      {/* Moon 아이콘: 다크 모드일 때 나타남 (절대 위치로 Sun 위에 겹침) */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}