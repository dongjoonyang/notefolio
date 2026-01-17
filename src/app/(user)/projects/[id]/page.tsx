// app/(user)/projects/[id]/page.tsx
import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import CommentSection from "./CommentSection";
import Link from "next/link";
import { cookies } from "next/headers";
import ProgressBar from "./ProgressBar"; 
import TOC from "./TOC";
import ContentView from "./ContentView";
import BackButton from "@/components/BackButton";

// ✅ 목록 페이지와 통일된 로딩 오버레이 컴포넌트
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin"></div>
        <p className="text-white dark:text-zinc-100 font-bold tracking-widest uppercase text-[10px]">Loading</p>
      </div>
    </div>
  );
}

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
    <article className="min-h-screen bg-white dark:bg-zinc-950 pb-20 relative transition-colors duration-300">
      <ProgressBar />

      {/* 1. 헤더 영역 (제목 등) */}
      <header className="pt-20 pb-12 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/30">
        <div className="max-w-3xl mx-auto px-6">

          <BackButton />

          <div className="flex items-center gap-3 mb-4">
            <span className="bg-black dark:bg-zinc-100 text-white dark:text-zinc-950 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
              {project.categoryName || "Uncategorized"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-zinc-50 leading-tight mb-6 tracking-tight">
            {project.title}
          </h1>
          <div className="text-gray-400 dark:text-zinc-500 text-sm font-medium">
            Published on {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* 2. 본문 영역 */}
      <div className="max-w-3xl mx-auto px-6 relative flex flex-col items-center content-view">
        <aside className="hidden xl:block absolute left-[calc(100%+60px)] top-16 h-full">
            <div className="sticky top-32 w-52">
              <TOC />
            </div>
        </aside>

        <div className="w-full py-16">
          {/* ✅ ContentView 내부의 isLoading 상태와 연동하여 로딩 스피너가 표시됩니다. */}
          <ContentView html={project.description} loadingOverlay={<LoadingOverlay />} />
          
          <div className="mt-24">
            <CommentSection projectId={id} isAdmin={isAdmin} />
          </div>
        </div>
      </div>

      {/* 3. 하단 내비게이션 */}
      <div className="max-w-3xl mx-auto px-6 mt-32 border-t border-gray-100 dark:border-zinc-800 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newerPost ? (
            <Link href={`/projects/${newerPost.id}`} className="group p-8 border border-gray-100 dark:border-zinc-800 rounded-3xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all text-left">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-2">이전 글</span>
              <span className="text-lg font-bold text-gray-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">← {newerPost.title}</span>
            </Link>
          ) : (
            <div className="p-8 border border-dashed border-gray-100 dark:border-zinc-800 rounded-3xl flex items-center justify-center opacity-40">
              <span className="text-sm text-gray-300 dark:text-zinc-600 font-medium">최신 게시물입니다</span>
            </div>
          )}
          {olderPost ? (
            <Link href={`/projects/${olderPost.id}`} className="group p-8 border border-gray-100 dark:border-zinc-800 rounded-3xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all text-right">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-2">다음 글</span>
              <span className="text-lg font-bold text-gray-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">{olderPost.title} →</span>
            </Link>
          ) : (
            <div className="p-8 border border-dashed border-gray-100 dark:border-zinc-800 rounded-3xl flex items-center justify-center opacity-40">
              <span className="text-sm text-gray-300 dark:text-zinc-600 font-medium">마지막 게시물입니다</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}