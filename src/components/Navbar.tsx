"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function NavbarContent({ categories, initialIsAdmin }: { categories: any[], initialIsAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('category');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. 상태 관리: 초기값은 서버 프롭을 따르지만, 마운트 후 쿠키로 재검증합니다.
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [isMounted, setIsMounted] = useState(false);

  // 2. 마운트 시점에 실제 쿠키 상태로 초기화 및 깜빡임 방지
  useEffect(() => {
    const hasAdminCookie = document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('is_admin='));
    
    setIsAdmin(hasAdminCookie);
    setIsMounted(true); // 이제 클라이언트 렌더링 준비 완료
  }, []);

  // 3. 실시간 쿠키 감시 (2초마다 모든 탭 동기화)
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

  // 4. 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const handleLogout = async () => {
    if (!confirm("정말 로그아웃 하시겠습니까?")) return;
    
    const res = await fetch("/api/logout", { method: "POST" });
    if (res.ok) {
      // 보조 쿠키 즉시 삭제
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setIsAdmin(false);
      router.refresh(); 
      router.push("/");
    }
  };

  // 마운트 전에는 관리자 UI를 렌더링하지 않아 깜빡임을 방지합니다.
  const showAdminMenu = isMounted && isAdmin;

  const getLinkStyle = (isActive: boolean) => 
    `flex items-center h-full px-1 transition-all duration-200 ${
      isActive ? "text-black font-bold border-b-2 border-black" : "text-gray-400 hover:text-black"
    }`;

  const getMobileLinkStyle = (isActive: boolean) => 
    `block text-2xl font-black py-4 ${isActive ? "text-black" : "text-gray-300"}`;

  return (
    <nav className="border-b bg-white sticky top-0 z-[60] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12 h-full">
          <Link href="/" className="font-black text-xl tracking-tighter z-[70]">Behance</Link>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium h-full">
            <Link href="/all" className={getLinkStyle(pathname === '/all' && !currentCategory)}>ALL</Link>
            {categories?.map((cat: any) => (
              <Link key={cat.id} href={`/all?category=${cat.name}`} className={getLinkStyle(currentCategory === cat.name)}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            {showAdminMenu && (
              <>
                <Link href="/admin" target="_blank" className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">ADMIN</Link>
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700">LOGOUT</button>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col gap-1.5 z-[70] p-2"
          >
            <motion.span animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-6 h-0.5 bg-black block" />
            <motion.span animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-0.5 bg-black block" />
            <motion.span animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-6 h-0.5 bg-black block" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[65] lg:hidden flex flex-col p-10 pt-24"
          >
            <div className="flex flex-col gap-2">
              <Link href="/all" className={getMobileLinkStyle(pathname === '/all' && !currentCategory)}>ALL</Link>
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/all?category=${cat.name}`} className={getMobileLinkStyle(currentCategory === cat.name)}>
                  {cat.name}
                </Link>
              ))}
            </div>
            {showAdminMenu && (
              <div className="mt-auto pt-10 border-t border-gray-100 flex flex-col gap-6">
                <Link href="/admin" target="_blank" className="text-blue-600 font-bold text-lg">ADMIN SETTINGS</Link>
                <button onClick={handleLogout} className="text-red-500 font-bold text-lg text-left">LOGOUT</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function Navbar({ categories = [], initialIsAdmin = false }: { categories: any[], initialIsAdmin?: boolean }) {
  return (
    <Suspense fallback={<div className="h-16 border-b bg-white" />}>
      <NavbarContent categories={categories} initialIsAdmin={initialIsAdmin} />
    </Suspense>
  );
}