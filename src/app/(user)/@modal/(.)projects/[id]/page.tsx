import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import CommentSection from "../../../projects/[id]/CommentSection";
import ContentView from "../../../projects/[id]/ContentView";
import ModalFrame from "@/components/ModalFrame";

function stripHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

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
    ORDER BY likeCount DESC, p.id DESC LIMIT 3
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
      <article className="w-full bg-white dark:bg-zinc-950 sm:rounded-3xl scrollbar-hide shadow-2xl overflow-hidden">
        <header className="pt-16 pb-12 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/30">
          <div className="max-w-3xl mx-auto px-6">
            <span className="bg-black dark:bg-zinc-100 text-white dark:text-zinc-950 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block mb-4">
              {project.categoryName || "Uncategorized"}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-zinc-50 leading-tight mb-6 tracking-tight">
              {project.title}
            </h1>
            <div className="text-gray-400 text-xs font-medium">
              Published on {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <ContentView html={project.description} projectId={project.id} />
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-12">
            {newerPost ? (
              <Link href={`/projects/${newerPost.id}`} replace className="group p-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">PREVIOUS</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">← {newerPost.title}</span>
              </Link>
            ) : (
              <div className="p-6 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center opacity-40">
                <span className="text-xs text-zinc-400 font-medium tracking-widest uppercase">Latest Post</span>
              </div>
            )}
            {olderPost ? (
              <Link href={`/projects/${olderPost.id}`} replace className="group p-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">NEXT</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors line-clamp-1">{olderPost.title} →</span>
              </Link>
            ) : (
              <div className="p-6 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center opacity-40">
                <span className="text-xs text-zinc-400 font-medium tracking-widest uppercase">Oldest Post</span>
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <section className="mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-10 text-center">More Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {recommendations.map((rec: any) => (
                  <Link key={rec.id} href={`/projects/${rec.id}`} replace className="group">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <Image src={rec.thumbnail || "/placeholder.jpg"} alt={rec.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h4 className="text-sm font-bold mt-4 line-clamp-1 group-hover:text-blue-600 transition-colors">{rec.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-20 pb-20">
            <CommentSection projectId={id} isAdmin={isAdmin} />
          </div>
        </div>
      </article>
    </ModalFrame>
  );
}