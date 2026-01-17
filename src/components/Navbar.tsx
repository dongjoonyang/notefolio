"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from "@/components/ThemeToggle"; // ✅ 테마 토글 버튼 임포트

function NavbarContent({ categories, initialIsAdmin }: { categories: any[], initialIsAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('category');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const hasAdminCookie = document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('is_admin='));
    
    setIsAdmin(hasAdminCookie);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = () => {
      const hasAdminCookie = document.cookie
        .split(';')
        .some((item) => item.trim().startsWith('is_admin='));
      
      if (isAdmin !== hasAdminCookie) {
        setIsAdmin(hasAdminCookie);
        router.refresh();
      }
    };

    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, [isAdmin, isMounted, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const handleLogout = async () => {
    if (!confirm("정말 로그아웃 하시겠습니까?")) return;
    
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsAdmin(false);
      router.refresh(); 
      router.push("/");
    }
  };

  const showAdminMenu = isMounted && isAdmin;

  const getLinkStyle = (isActive: boolean) => 
    `flex items-center h-full px-1 transition-all duration-200 ${
      isActive 
        ? "text-zinc-900 dark:text-zinc-50 font-bold border-b-2 border-zinc-900 dark:border-zinc-50" 
        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
    }`;

  const getMobileLinkStyle = (isActive: boolean) => 
    `block text-2xl font-black py-4 ${isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-300 dark:text-zinc-700"}`;

  return (
    <nav className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-[60] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12 h-full">
          <Link href="/" className="font-black text-xl tracking-tighter z-[70] text-zinc-900 dark:text-zinc-50">Behance</Link>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium h-full">
            <Link href="/all" className={getLinkStyle(pathname === '/all' && !currentCategory)}>All Works</Link>
            {/* 💡 노출 설정(isVisible === 1)된 카테고리만 렌더링 */}
            {categories
              ?.filter((cat: any) => Number(cat.isVisible) !== 0)
              .map((cat: any) => (
                <Link key={cat.id} href={`/all?category=${cat.name}`} className={getLinkStyle(currentCategory === cat.name)}>
                  {cat.name}
                </Link>
              ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-5">
            <ThemeToggle />
            {showAdminMenu && (
              <>
                <Link href="/admin" target="_blank" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">ADMIN</Link>
                <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 dark:text-red-400 hover:opacity-70 transition-opacity">LOGOUT</button>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col gap-1.5 z-[70] p-2"
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-6 h-0.5 bg-zinc-900 dark:bg-zinc-50 block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-0.5 bg-zinc-900 dark:bg-zinc-50 block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-6 h-0.5 bg-zinc-900 dark:bg-zinc-50 block" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[65] lg:hidden flex flex-col p-10 pt-24"
          >
            <div className="flex flex-col gap-2">
              <Link href="/all" className={getMobileLinkStyle(pathname === '/all' && !currentCategory)}>All Works</Link>
              {/* 💡 모바일 메뉴에서도 노출 설정된 것만 필터링 */}
              {categories
                ?.filter((cat: any) => Number(cat.isVisible) !== 0)
                .map((cat: any) => (
                  <Link key={cat.id} href={`/all?category=${cat.name}`} className={getMobileLinkStyle(currentCategory === cat.name)}>
                    {cat.name}
                  </Link>
                ))}
            </div>
            
            <div className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Appearance</span>
                <ThemeToggle />
              </div>
              
              {showAdminMenu && (
                <>
                  <Link href="/admin" target="_blank" className="text-blue-600 dark:text-blue-400 font-bold text-lg">ADMIN SETTINGS</Link>
                  <button onClick={handleLogout} className="text-red-500 dark:text-red-400 font-bold text-lg text-left">LOGOUT</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function Navbar({ categories = [], initialIsAdmin = false }: { categories: any[], initialIsAdmin?: boolean }) {
  return (
    <Suspense fallback={<div className="h-16 border-b bg-white dark:bg-zinc-950 dark:border-zinc-800" />}>
      <NavbarContent categories={categories} initialIsAdmin={initialIsAdmin} />
    </Suspense>
  );
}