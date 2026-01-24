"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, LayoutDashboard, Moon, Sun, Settings } from "lucide-react";
import { useTheme } from "next-themes"; 

function NavbarContent({ categories, initialIsAdmin }: { categories: any[], initialIsAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme(); 
  const currentCategory = searchParams.get('category');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    setIsDropdownOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const close = () => setIsDropdownOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [isDropdownOpen]);

  const showAdminMenu = isMounted && isAdmin;

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // 💡 border-b-2 제거됨 (motion으로 대체)
  const getLinkStyle = (isActive: boolean) => 
    `relative flex items-center h-full px-1 transition-all duration-200 ${
      isActive 
        ? "text-zinc-900 dark:text-zinc-50 font-bold" 
        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
    }`;

  const getMobileLinkStyle = (isActive: boolean) => 
    `block text-2xl font-black py-4 ${isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-300 dark:text-zinc-700"}`;

  return (
    <nav className="bg-white dark:bg-zinc-950 sticky top-0 z-[60] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12 h-full">
          <Link href="/" className="font-black text-xl tracking-tighter z-[70] text-zinc-900 dark:text-zinc-50">ONOFF Studio</Link>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium h-full">
            <Link href="/all" className={getLinkStyle(pathname === '/all' && !currentCategory)}>
              All Works
              {pathname === '/all' && !currentCategory && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-50"
                />
              )}
            </Link>
            {categories
              ?.filter((cat: any) => Number(cat.isVisible) !== 0)
              .map((cat: any) => {
                const isActive = currentCategory === cat.name;
                return (
                  <Link key={cat.id} href={`/all?category=${cat.name}`} className={getLinkStyle(isActive)}>
                    {cat.name}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-50"
                      />
                    )}
                  </Link>
                );
              })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
              >
                <MoreHorizontal size={24} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-52 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-[80]"
                  >
                    <div className="px-2 pb-1 mb-1 border-b border-zinc-50 dark:border-zinc-800/50">
                      <button 
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors text-left group"
                      >
                        <div className="text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          {isMounted && (theme === "dark" ? <Sun size={19} /> : <Moon size={19} />)}
                        </div>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          {isMounted && (theme === "dark" ? "라이트 모드" : "다크 모드")}
                        </span>
                      </button>
                    </div>

                    <div className="px-2">
                      {showAdminMenu ? (
                        <Link 
                          href="/admin" 
                          target="_blank"
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <LayoutDashboard size={19} />
                          관리자 스튜디오
                        </Link>
                      ) : (
                        <Link 
                          href="/login" 
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Settings size={19} />
                          관리자 로그인
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              {categories
                ?.filter((cat: any) => Number(cat.isVisible) !== 0)
                .map((cat: any) => (
                  <Link key={cat.id} href={`/all?category=${cat.name}`} className={getMobileLinkStyle(currentCategory === cat.name)}>
                    {cat.name}
                  </Link>
                ))}
            </div>
            
            <div className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-8">
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-4 p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl active:scale-95 transition-all"
              >
                <div className="text-zinc-600 dark:text-zinc-300">
                  {isMounted && (theme === "dark" ? <Sun size={24} /> : <Moon size={24} />)}
                </div>
                <span className="text-zinc-700 dark:text-zinc-200 font-bold text-lg">
                  {isMounted && (theme === "dark" ? "라이트 모드" : "다크 모드")}
                </span>
              </button>
              {showAdminMenu && (
                <Link href="/admin" target="_blank" className="py-5 bg-blue-600 text-white rounded-2xl text-center font-black text-lg uppercase tracking-wider">ADMIN STUDIO</Link>
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