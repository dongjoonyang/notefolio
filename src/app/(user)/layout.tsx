import { pool } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const [categories]: any = await pool.query("SELECT * FROM Category ORDER BY sortOrder ASC");
    
  // 💡 서버에서 쿠키를 확인하여 관리자 여부를 결정합니다.
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has("admin_session");

  return (
    <>
      {/* 서버에서 만든 isAdmin 상태를 Navbar에 주입 */}
      <Navbar categories={categories} initialIsAdmin={isAdmin} />
      <main>{children}</main>
    </>
  );
}

