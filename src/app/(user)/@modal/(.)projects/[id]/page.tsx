import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import CommentSection from "../../../projects/[id]/CommentSection";
import ContentView from "../../../projects/[id]/ContentView";
import ModalFrame from "@/components/ModalFrame";
import ProjectCarousel from "@/components/ProjectCarousel";
import ViewCounter from "@/components/ViewCounter"; 

export default async function ProjectModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin_session");

  const [rows]: any = await pool.query(`
    SELECT p.*, c.name as categoryName 
    FROM Project p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE p.id = ?
  `, [id]);

  const project = rows[0];
  if (!project) notFound();

  const [recommendations]: any = await pool.query(`
    SELECT p.id, p.title, p.thumbnail, p.description,
    (SELECT COUNT(*) FROM ProjectLike WHERE projectId = p.id) as likeCount
    FROM Project p WHERE p.isVisible = 1 AND p.id != ?
    ORDER BY likeCount DESC, p.id DESC LIMIT 10
  `, [id]);

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
    <ModalFrame>
      <ViewCounter id={id} /> 
      
      {/* 💡 BRAND RIBBON POINT: 팝업 우측 상단 브랜드 포인트 */}
<div className="absolute top-0 right-10 z-[50] pointer-events-none hidden lg:block">
  {/* filter: drop-shadow를 부모에 주면 잘린 리본 모양대로 그림자가 생깁니다 */}
  <div className="relative w-12 h-16 flex items-start justify-center pt-3 filter drop-shadow-md">
    
    {/* 1. 배경 리본 (배경만 clip-path 적용) */}
    <div 
      className="absolute inset-0 bg-zinc-900 dark:bg-zinc-100"
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'
      }}
    />

    {/* 2. 브랜드 아이콘 (z-index를 확실히 높이고 mb-3 대신 pt-3 정렬 활용) */}
    <img 
      src="https://www.pluglog.com/apple-touch-icon.png" 
      alt="Brand Icon" 
      className="relative z-[60] w-8 h-8 object-contain invert dark:invert-0" 
      style={{ display: 'block' }} // 가끔 렌더링 누락 방지
    />
    
  </div>
</div>

      <article className="w-full bg-white dark:bg-zinc-950 sm:rounded-xl shadow-2xl overflow-hidden">
        <header className="pt-14 pb-8 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/30">
          <div className="max-w-full mx-auto px-8 md:px-10 lg:px-14">
            <span className="bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-normal inline-block mb-4">
              {project.categoryName || "Uncategorized"}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-zinc-50 leading-tight mb-6 tracking-tight">
              {project.title}
            </h1>
            
            <div className="flex justify-between items-center text-gray-400 text-xs font-medium uppercase tracking-widest">
              <div>
                발행일 {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>
                © All Rights Reserved
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-full mx-auto leading-normal">
          <ContentView html={project.description} projectId={project.id} />
          
          <div className="px-8 md:px-10 lg:px-14 pb-12">
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {newerPost ? (
                <Link href={`/projects/${newerPost.id}`} replace className="group p-8 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left">
                  <span className="text-[14px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">이전 글</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">← {newerPost.title}</span>
                </Link>
              ) : (
                <div className="p-8 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center opacity-40 text-xs text-zinc-400 font-medium tracking-widest uppercase">
                  Latest Post
                </div>
              )}
              
              {olderPost ? (
                <Link href={`/projects/${olderPost.id}`} replace className="group p-8 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-right">
                  <span className="text-[14px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">다음 글</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">{olderPost.title} →</span>
                </Link>
              ) : (
                <div className="p-8 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center opacity-40 text-xs text-zinc-400 font-medium tracking-widest uppercase">
                  Oldest Post
                </div>
              )}
            </div>

            {recommendations.length > 0 && (
              <section className="mt-12">
                <ProjectCarousel recommendations={recommendations} />
              </section>
            )}

            <div className="mt-12">
              <CommentSection projectId={id} isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </article>
    </ModalFrame>
  );
}