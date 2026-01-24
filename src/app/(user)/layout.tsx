import { pool } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";

export default async function UserLayout({ 
  children,
  modal // 💡 추가된 부분: 병렬 라우트(@modal)를 받습니다.
}: { 
  children: React.ReactNode;
  modal: React.ReactNode; // 💡 타입 정의를 추가했습니다.
}) {
  const [categories]: any = await pool.query("SELECT * FROM Category ORDER BY sortOrder ASC");
    
  // 💡 기존 로직 유지: 서버에서 쿠키를 확인하여 관리자 여부를 결정합니다.
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has("admin_session");

  return (
    <>
      {/* 기존 Navbar 유지 */}
      <Navbar categories={categories} initialIsAdmin={isAdmin} />
      <main>
        {children} {/* 기존 목록 페이지 */}
        {modal}    {/* 💡 추가된 부분: 가로채기 팝업이 렌더링될 구멍 */}
      </main>
    </>
  );
}