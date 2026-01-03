// app/(user)/projects/[id]/page.tsx
import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import CommentSection from "./CommentSection";
import Link from "next/link";
import { cookies } from "next/headers";
import ProgressBar from "./ProgressBar"; 
import TOC from "./TOC";
import ContentView from "./ContentView";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin_session");

  // DB 데이터 호출
  const [rows]: any = await pool.query(`
    SELECT p.*, c.name as categoryName 
    FROM Project p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE p.id = ?
  `, [id]);

  const project = rows[0];
  if (!project) notFound();

  const [newerRows]: any = await pool.query(
    "SELECT id, title FROM Project WHERE sortOrder < ? ORDER BY sortOrder DESC LIMIT 1",
    [project.sortOrder]
  );
  const [olderRows]: any = await pool.query(
    "SELECT id, title FROM Project WHERE sortOrder > ? ORDER BY sortOrder ASC LIMIT 1",
    [project.sortOrder]
  );

  const newerPost = newerRows[0];
  const olderPost = olderRows[0];

  return (
    <article className="min-h-screen bg-white pb-20 relative">
      <ProgressBar />

      {/* 1. 헤더 영역 (제목 등) */}
      <header className="pt-20 pb-12 border-b border-gray-50 bg-gray-50/30">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/all" className="text-sm font-medium text-gray-400 hover:text-black transition-colors mb-8 inline-block">
            ← 전체 목록으로
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-black text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
              {project.categoryName || "Uncategorized"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
            {project.title}
          </h1>
          <div className="text-gray-400 text-sm font-medium">
            Published on {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* 2. 본문 영역 (ContentView 내부에 스켈레톤 적용) */}
      <div className="max-w-3xl mx-auto px-6 relative flex flex-col items-center content-view">
        <aside className="hidden xl:block absolute left-[calc(100%+60px)] top-16 h-full">
            <div className="sticky top-32 w-52">
              <TOC />
            </div>
        </aside>

        <div className="w-full py-16">
          {/* ✅ 여기서 스켈레톤과 본문 내용이 교체됩니다. */}
          <ContentView html={project.description} />
          
          <div className="mt-24">
            <CommentSection projectId={id} isAdmin={isAdmin} />
          </div>
        </div>
      </div>

      {/* 3. 하단 내비게이션 (이전/다음 글) */}
      <div className="max-w-3xl mx-auto px-6 mt-32 border-t border-gray-100 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newerPost ? (
            <Link href={`/projects/${newerPost.id}`} className="group p-8 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">이전 글</span>
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">← {newerPost.title}</span>
            </Link>
          ) : (
            <div className="p-8 border border-dashed border-gray-100 rounded-3xl flex items-center justify-center opacity-40">
              <span className="text-sm text-gray-300 font-medium">최신 게시물입니다</span>
            </div>
          )}
          {olderPost ? (
            <Link href={`/projects/${olderPost.id}`} className="group p-8 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2">다음 글</span>
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{olderPost.title} →</span>
            </Link>
          ) : (
            <div className="p-8 border border-dashed border-gray-100 rounded-3xl flex items-center justify-center opacity-40">
              <span className="text-sm text-gray-300 font-medium">마지막 게시물입니다</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}