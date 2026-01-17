"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Loader2, CheckSquare, Square } from "lucide-react";
import ProjectVisibleToggle from "@/components/ProjectVisibleToggle";
import ProjectShowInAllToggle from "@/components/ProjectShowInAllToggle";
import DeleteButton from "@/components/DeleteButton";
import { deleteMultipleProjects } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function AdminProjectList({ projects: initialProjects }: { projects: any[] }) {
  // 💡 데이터를 상태(projects)로 관리해야 실시간으로 화면이 바뀝니다.
  const [projects, setProjects] = useState(initialProjects);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // 💡 Visible 토글이 클릭되었을 때 호출될 함수
  const handleVisibleChange = (id: number, newVisible: number) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, isVisible: newVisible } : p))
    );
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
  };

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto z-50 bg-black text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center justify-between md:justify-center gap-4 md:gap-6 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:gap-2">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Selected</span>
            <span className="text-sm font-black uppercase tracking-tighter">{selectedIds.length} Projects</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleBatchDelete} disabled={isDeleting} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-[11px] font-black transition-all active:scale-95 uppercase">
              {isDeleting ? <Loader2 className="animate-spin" size={12} /> : <Trash2 size={12} />}
              Delete
            </button>
            <button onClick={() => setSelectedIds([])} className="text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase">Cancel</button>
          </div>
        </div>
      )}

      {/* 데스크톱 테이블 */}
      <table className="hidden md:table w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
            <th className="px-6 py-4 w-12"><button onClick={toggleAll}>{selectedIds.length === projects.length && projects.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}</button></th>
            <th className="px-6 py-4">Thumbnail</th>
            <th className="px-6 py-4">Project Title</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Settings</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {projects.map((project: any) => (
            <tr key={project.id} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(project.id)} onChange={() => toggleSelect(project.id)} className="w-4 h-4 rounded accent-black" /></td>
              <td className="px-6 py-4">
                <div className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                  {project.thumbnail ? <Image src={project.thumbnail} alt="thumb" fill className="object-cover" /> : <div className="text-[10px] text-slate-300 font-bold flex items-center justify-center h-full">NO IMG</div>}
                </div>
              </td>
              <td className="px-6 py-4 font-bold text-slate-800">{project.title}</td>
              <td className="px-6 py-4"><span className="text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter bg-slate-100 text-slate-600">{project.categoryName || "UNCATEGORIZED"}</span></td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 w-12">VISIBLE</span>
                    <ProjectVisibleToggle 
                      id={project.id} 
                      initialVisible={project.isVisible} 
                      onStatusChange={(val) => handleVisibleChange(project.id, val)} // 💡 실시간 연동 핵심
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 w-12">ALL WORKS</span>
                    <ProjectShowInAllToggle 
                      id={project.id} 
                      initialShowInAll={project.showInAll} 
                      isParentVisible={project.isVisible} // 💡 위에서 바뀐 상태가 즉시 전달됨
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-6 items-center text-[11px] font-black uppercase tracking-widest">
                  <Link href={`/admin/projects/edit/${project.id}`} className="text-slate-400 hover:text-black">EDIT</Link>
                  <DeleteButton id={project.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모바일 리스트 */}
      <div className="md:hidden divide-y divide-gray-100 bg-white">
        {projects.map((project: any) => (
          <div key={project.id} className="p-4 flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              <input type="checkbox" checked={selectedIds.includes(project.id)} onChange={() => toggleSelect(project.id)} className="w-5 h-5 rounded accent-black shrink-0 mt-1" />
              <div className="relative w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                {project.thumbnail ? <Image src={project.thumbnail} alt="thumb" fill className="object-cover" /> : <div className="text-[8px] text-slate-300 font-bold flex items-center justify-center h-full uppercase">No Img</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest truncate">{project.categoryName || "UNCATEGORIZED"}</p>
                <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 uppercase">{project.title}</h4>
              </div>
            </div>
            <div className="flex items-center justify-between pl-8">
              <div className="flex items-center gap-5 scale-90 origin-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase">Visible</span>
                  <ProjectVisibleToggle 
                    id={project.id} 
                    initialVisible={project.isVisible} 
                    onStatusChange={(val) => handleVisibleChange(project.id, val)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase">All Works</span>
                  <ProjectShowInAllToggle 
                    id={project.id} 
                    initialShowInAll={project.showInAll} 
                    isParentVisible={project.isVisible} 
                  />
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <Link href={`/admin/projects/edit/${project.id}`} className="text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-widest">EDIT</Link>
                <DeleteButton id={project.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}