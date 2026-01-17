import { pool } from "@/lib/db";
import Link from "next/link";
import AdminProjectList from "@/components/AdminProjectList"; // 💡 컴포넌트 추가

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const { page, q, category } = await searchParams;

  const currentPage = Number(page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;
  const searchTerm = q || "";
  const categoryId = category || "";

  // 1. 쿼리 빌드 (기존 유지)
  let countQuery = "SELECT COUNT(*) as count FROM Project WHERE 1=1";
  let dataQuery = `
    SELECT p.*, c.name as categoryName 
    FROM Project p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE 1=1
  `;
  const queryParams: any[] = [];

  if (searchTerm) {
    countQuery += " AND title LIKE ?";
    dataQuery += " AND title LIKE ?";
    queryParams.push(`%${searchTerm}%`);
  }

  if (categoryId) {
    countQuery += " AND categoryId = ?";
    dataQuery += " AND categoryId = ?";
    queryParams.push(categoryId);
  }

  // 2. 데이터 병렬 로드 (기존 유지)
  const [
    [allCountRes], 
    [categoryStats], 
    [totalResult], 
    [projects]
  ]: any = await Promise.all([
    pool.query("SELECT COUNT(*) as count FROM Project"),
    pool.query(`
      SELECT c.id, c.name, COUNT(p.id) as projectCount 
      FROM Category c 
      LEFT JOIN Project p ON c.id = p.categoryId 
      GROUP BY c.id, c.name, c.sortOrder
      ORDER BY c.sortOrder ASC
    `),
    pool.query(countQuery, queryParams),
    pool.query(dataQuery + " ORDER BY p.createdAt DESC LIMIT ? OFFSET ?", [...queryParams, limit, offset])
  ]);

  const absoluteTotal = allCountRes[0].count;
  const filteredTotal = totalResult[0].count; 
  const totalPages = Math.ceil(filteredTotal / limit);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* 헤더 섹션 (기존 유지) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-sans">프로젝트 관리</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">데이터 현황을 파악하고 관리하세요.</p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="w-full sm:w-auto text-center bg-black text-white px-5 py-3 rounded-xl hover:bg-zinc-800 transition shadow-sm font-medium text-sm uppercase tracking-tighter"
        >
          + NEW PROJECT
        </Link>
      </div>

      {/* 통계 카드 (기존 유지) */}
      <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 scrollbar-hide">
        <Link 
          href="/admin/projects"
          className={`shrink-0 w-[120px] md:w-auto p-4 rounded-2xl border transition shadow-sm ${
            !categoryId ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100 text-gray-800 hover:border-gray-300"
          }`}
        >
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${!categoryId ? "opacity-60" : "text-slate-400"}`}>TOTAL</p>
          <p className="text-2xl font-black">{absoluteTotal}</p>
        </Link>

        {categoryStats.map((stat: any) => (
          <Link 
            key={stat.id}
            href={`/admin/projects?category=${stat.id}`}
            className={`shrink-0 w-[120px] md:w-auto p-4 rounded-2xl border transition shadow-sm ${
              categoryId === String(stat.id) ? "border-black bg-slate-50 text-black" : "bg-white border-gray-100 text-gray-800 hover:border-gray-300"
            }`}
          >
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 truncate ${categoryId === String(stat.id) ? "text-slate-900" : "text-slate-400"}`}>
              {stat.name}
            </p>
            <p className="text-2xl font-black">{stat.projectCount}</p>
          </Link>
        ))}
      </div>

      {/* 필터 바 (기존 유지) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-6 shadow-sm">
        <form action="/admin/projects" method="GET" className="flex flex-col md:flex-row gap-3">
          <select 
            name="category" 
            defaultValue={categoryId}
            className="w-full md:w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50 cursor-pointer font-bold"
          >
            <option value="">ALL CATEGORIES</option>
            {categoryStats.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            name="q" 
            defaultValue={searchTerm}
            placeholder="SEARCH TITLE..." 
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none bg-gray-50 font-medium"
          />
          <button className="w-full md:w-auto bg-black text-white px-8 py-2.5 rounded-xl text-xs hover:bg-zinc-800 transition font-black uppercase">
            Search
          </button>
        </form>
      </div>

      {/* 리스트 섹션 💡 교체된 부분 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <AdminProjectList projects={projects} />
      </div>

      {/* 페이징 (기존 유지) */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/projects?page=${p}${searchTerm ? `&q=${searchTerm}` : ""}${categoryId ? `&category=${categoryId}` : ""}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-[11px] font-black transition ${
                p === currentPage
                  ? "bg-black text-white shadow-xl shadow-slate-200"
                  : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}