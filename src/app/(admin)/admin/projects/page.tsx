import { pool } from "@/lib/db";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

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

  // --- 💡 [데이터 집계 섹션] ---

  // 1. 진짜 DB에 존재하는 전체 프로젝트 개수
  const [allCountRes]: any = await pool.query("SELECT COUNT(*) as count FROM Project");
  const absoluteTotal = allCountRes[0].count;

  // 2. ✅ 카테고리별 프로젝트 개수 (정렬 기준 수정)
  // 'orderIndex' 컬럼을 기준으로 정렬하여 관리 탭에서 설정한 순서를 유지합니다.
  const [categoryStats]: any = await pool.query(`
    SELECT c.id, c.name, COUNT(p.id) as projectCount 
    FROM Category c 
    LEFT JOIN Project p ON c.id = p.categoryId 
    GROUP BY c.id, c.name
    ORDER BY c.sortOrder ASC
  `);
  // 3. 미분류(카테고리 NULL) 프로젝트 개수
  const [noCategoryRes]: any = await pool.query(`
    SELECT COUNT(*) as count FROM Project WHERE categoryId IS NULL
  `);
  const uncategorizedCount = noCategoryRes[0].count;

  // --- 💡 [리스트 조회 섹션] ---

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

  const [totalResult]: any = await pool.query(countQuery, queryParams);
  const filteredTotal = totalResult[0].count; 
  const totalPages = Math.ceil(filteredTotal / limit);

  dataQuery += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
  const [projects]: any = await pool.query(dataQuery, [...queryParams, limit, offset]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans">프로젝트 관리</h1>
          <p className="text-sm text-gray-500 mt-1">데이터 현황을 파악하고 관리하세요.</p>
        </div>
        <Link 
          href="/admin/projects/new" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm font-medium"
        >
          + 새 프로젝트
        </Link>
      </div>

      {/* 📊 1. 요약 통계 카드 (순서 반영됨) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {/* 전체보기 버튼 역할을 겸함 */}
        <Link 
          href="/admin/projects"
          className={`p-4 rounded-2xl border transition shadow-sm ${
            !categoryId ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100 text-gray-800 hover:border-gray-300"
          }`}
        >
          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${!categoryId ? "opacity-60" : "text-gray-400"}`}>TOTAL</p>
          <p className="text-2xl font-extrabold">{absoluteTotal}</p>
        </Link>

        {/* 각 카테고리 (순서대로 정렬됨) */}
        {categoryStats.map((stat: any) => (
          <Link 
            key={stat.id}
            href={`/admin/projects?category=${stat.id}`}
            className={`p-4 rounded-2xl border transition shadow-sm ${
              categoryId === String(stat.id) ? "border-blue-500 bg-blue-50 text-blue-600" : "bg-white border-gray-100 text-gray-800 hover:border-blue-300"
            }`}
          >
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 truncate ${categoryId === String(stat.id) ? "text-blue-400" : "text-gray-400"}`}>
              {stat.name}
            </p>
            <p className="text-2xl font-bold">
              {stat.projectCount}
            </p>
          </Link>
        ))}

        {/* 미분류 */}
        {uncategorizedCount > 0 && (
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl shadow-sm">
            <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider mb-1">미분류</p>
            <p className="text-2xl font-bold text-orange-600">{uncategorizedCount}</p>
          </div>
        )}
      </div>

      {/* 🔍 2. 필터 및 검색 바 */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 mb-6 shadow-sm flex flex-wrap gap-3 items-center">
        <form action="/admin/projects" method="GET" className="flex flex-1 gap-3">
          <select 
            name="category" 
            defaultValue={categoryId}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 cursor-pointer"
          >
            <option value="">모든 카테고리</option>
            {categoryStats.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input 
            type="text" 
            name="q" 
            defaultValue={searchTerm}
            placeholder="프로젝트 제목 검색..." 
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
          />

          <button className="bg-gray-800 text-white px-6 py-2 rounded-xl text-sm hover:bg-black transition font-bold">
            검색
          </button>
        </form>
        
        {(searchTerm || categoryId) && (
          <Link href="/admin/projects" className="text-xs text-gray-400 hover:text-red-500 transition underline underline-offset-4">
            필터 초기화
          </Link>
        )}
      </div>

      {/* 📄 3. 리스트 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Project Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.length > 0 ? (
              projects.map((project: any) => (
                <tr key={project.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{project.title}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      project.categoryName ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {project.categoryName || "미분류"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-4">
                    <Link 
                      href={`/admin/projects/edit/${project.id}`} 
                      className="text-gray-400 hover:text-blue-600 text-sm font-bold transition"
                    >
                      EDIT
                    </Link>
                    <DeleteButton id={project.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-gray-300 font-medium">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔢 4. 페이징 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/projects?page=${p}${searchTerm ? `&q=${searchTerm}` : ""}${categoryId ? `&category=${categoryId}` : ""}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition ${
                p === currentPage
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                  : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
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