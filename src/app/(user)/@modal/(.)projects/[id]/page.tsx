import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import CommentSection from "../../../projects/[id]/CommentSection";
import ContentView from "../../../projects/[id]/ContentView";
import ModalFrame from "@/components/ModalFrame";
import ProjectCarousel from "@/components/ProjectCarousel";
import ViewCounter from "@/components/ViewCounter"; // 💡 추가됨

export default async function ProjectModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin_session");

  // 1. 프로젝트 상세 데이터 가져오기
  const [rows]: any = await pool.query(`
    SELECT p.*, c.name as categoryName 
    FROM Project p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE p.id = ?
  `, [id]);

  const project = rows[0];
  if (!project) notFound();

  // 2. 추천 프로젝트 (Carousel)
  const [recommendations]: any = await pool.query(`
    SELECT p.id, p.title, p.thumbnail, p.description,
    (SELECT COUNT(*) FROM ProjectLike WHERE projectId = p.id) as likeCount
    FROM Project p WHERE p.isVisible = 1 AND p.id != ?
    ORDER BY likeCount DESC, p.id DESC LIMIT 10
  `, [id]);

  // 3. 이전글 / 다음글 로직
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
      {/* 💡 조회수 증가 로직 실행 (화면엔 안 보임) */}
      <ViewCounter id={id} /> 
      
      <article className="w-full bg-white dark:bg-zinc-950 sm:rounded-xl shadow-2xl overflow-hidden">
        {/* 헤더 섹션: 카테고리와 날짜 복구 */}
        <header className="pt-20 pb-12 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/30">
          <div className="max-w-5xl mx-auto px-8 md:px-10">
            <span className="bg-black dark:bg-zinc-100 text-white dark:text-zinc-950 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block mb-6">
              {project.categoryName || "Uncategorized"}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-zinc-50 leading-[1.1] mb-8 tracking-tight">
              {project.title}
            </h1>
            <div className="text-gray-400 text-xs font-medium uppercase tracking-widest">
              Published on {new Date(project.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 (이미지 풀 블리드 적용) */}
        <div className="max-w-5xl mx-auto">
          {/* ContentView 내부에 좋아요 버튼(inner-like-btn)이 포함되어 있다고 가정합니다. */}
          <ContentView html={project.description} projectId={project.id} />
          
          {/* 하단 섹션 여백 처리 (px-8 md:px-10) */}
          <div className="px-8 md:px-10 pb-24">
            {/* 이전글/다음글 네비게이션 */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-16">
              {newerPost ? (
                <Link href={`/projects/${newerPost.id}`} replace className="group p-8 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">PREVIOUS PROJECT</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">← {newerPost.title}</span>
                </Link>
              ) : (
                <div className="p-8 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center opacity-40 text-xs text-zinc-400 font-medium tracking-widest uppercase">
                  Latest Post
                </div>
              )}
              
              {olderPost ? (
                <Link href={`/projects/${olderPost.id}`} replace className="group p-8 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">NEXT PROJECT</span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">{olderPost.title} →</span>
                </Link>
              ) : (
                <div className="p-8 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl flex items-center justify-center opacity-40 text-xs text-zinc-400 font-medium tracking-widest uppercase">
                  Oldest Post
                </div>
              )}
            </div>

            {/* 추천 캐러셀 섹션 */}
            {recommendations.length > 0 && (
              <section className="mt-24 pt-20 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-[20px] font-black text-zinc-800 dark:text-zinc-100 uppercase mb-12">More Projects</h3>
                <ProjectCarousel recommendations={recommendations} />
              </section>
            )}

            {/* 댓글 섹션 */}
            <div className="mt-24">
              <CommentSection projectId={id} isAdmin={isAdmin} />
            </div>
          </div>
        </div>
      </article>
    </ModalFrame>
  );
}