'use client';

import { deleteProject } from "@/lib/actions"; 
import { Trash2 } from "lucide-react"; // 💡 아이콘 추가

export default function DeleteButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (!confirm("정말 이 프로젝트를 삭제하시겠습니까?")) return;

    const result = await deleteProject(id);

    if (result.success) {
      alert("삭제되었습니다.");
    } else {
      alert("삭제 실패했습니다.");
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group"
      title="삭제"
    >
      <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
    </button>
  );
}