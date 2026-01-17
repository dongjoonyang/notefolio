"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Loader2, CheckSquare, Square } from "lucide-react";
import ProjectVisibleToggle from "@/components/ProjectVisibleToggle";
import DeleteButton from "@/components/DeleteButton";
import { deleteMultipleProjects } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function AdminProjectList({ projects }: { projects: any[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === projects.length ? [] : projects.map(p => p.id));
  };

  const handleBatchDelete = async () => {
    if (!confirm(`선택한 ${selectedIds.length}개의 프로젝트를 삭제하시겠습니까?`)) return;
    setIsDeleting(true);
    try {
      const res = await deleteMultipleProjects(selectedIds);
      if (res.success) {
        alert("삭제되었습니다.");
        setSelectedIds([]);
        router.refresh();
      }
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 일괄 삭제 플로팅 바 */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-5 border border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Selected</span>
            <span className="text-sm font-black uppercase tracking-tighter">{selectedIds.length} Projects</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <button 
            onClick={handleBatchDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all active:scale-95 uppercase shadow-lg shadow-red-500/20"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
            Delete All
          </button>
          <button onClick={() => setSelectedIds([])} className="text-[11px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">
            Cancel
          </button>
        </div>
      )}

      {/* 데스크탑 테이블 */}
      <table className="hidden md:table w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
            <th className="px-6 py-4 w-12">
              <button onClick={toggleAll} className="hover:text-black transition-colors">
                {selectedIds.length === projects.length && projects.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
              </button>
            </th>
            <th className="px-6 py-4">Thumbnail</th>
            <th className="px-6 py-4">Project Title</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Visible</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {projects.map((project: any) => (
            <tr key={project.id} className={`hover:bg-gray-50/80 transition-colors ${selectedIds.includes(project.id) ? "bg-slate-50" : ""}`}>
              <td className="px-6 py-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(project.id)}
                  onChange={() => toggleSelect(project.id)}
                  className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                />
              </td>
              <td className="px-6 py-4">
                <div className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                  {project.thumbnail ? (
                    <Image src={project.thumbnail} alt="thumb" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] text-slate-300 font-bold">NO IMG</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 font-bold text-slate-800">{project.title}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter ${
                  project.categoryName ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-600"
                }`}>
                  {project.categoryName || "UNCATEGORIZED"}
                </span>
              </td>
              <td className="px-6 py-4">
                <ProjectVisibleToggle id={project.id} initialVisible={project.isVisible} />
              </td>
              <td className="px-6 py-4 text-[11px] text-slate-400 font-mono">
                {new Date(project.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-6 items-center">
                  <Link href={`/admin/projects/edit/${project.id}`} className="text-slate-400 hover:text-black text-[11px] font-black transition uppercase tracking-widest">EDIT</Link>
                  <DeleteButton id={project.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모바일 리스트 */}
      <div className="md:hidden divide-y divide-gray-100">
        {projects.map((project: any) => (
          <div key={project.id} className={`p-5 flex flex-col gap-4 transition-colors ${selectedIds.includes(project.id) ? "bg-slate-50" : ""}`}>
            <div className="flex gap-4 items-center">
              <input type="checkbox" checked={selectedIds.includes(project.id)} onChange={() => toggleSelect(project.id)} className="w-5 h-5 rounded border-gray-300 accent-black shrink-0" />
              <div className="relative w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                {project.thumbnail ? <Image src={project.thumbnail} alt="thumb" fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-[10px] text-slate-300 font-bold">NO IMG</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest truncate">{project.categoryName || "UNCATEGORIZED"}</p>
                  <ProjectVisibleToggle id={project.id} initialVisible={project.isVisible} />
                </div>
                <h4 className="font-bold text-slate-800 truncate leading-tight">{project.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/projects/edit/${project.id}`} className="flex-1 bg-gray-50 text-slate-600 text-center py-2.5 rounded-xl text-[11px] font-black uppercase border border-gray-100 shadow-sm">EDIT</Link>
              <div className="flex-1"><DeleteButton id={project.id} /></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}