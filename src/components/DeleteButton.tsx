'use client';

import { deleteProject } from "@/lib/actions"; 

export default function DeleteButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (!confirm("정말 이 프로젝트를 삭제하시겠습니까?")) return;

    // fetch 대신 아까 만든 서버 함수를 직접 호출
    const result = await deleteProject(id);

    if (result.success) {
      alert("삭제되었습니다.");
      // window.location.reload()를 안 해도 revalidatePath 덕분에 목록이 갱신됩니다.
    } else {
      alert("삭제 실패했습니다.");
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-500 hover:underline">
      삭제
    </button>
  );
}