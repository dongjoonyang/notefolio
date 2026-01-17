"use client";

import { useState } from "react";

// 💡 isParentVisible (메인 Visible 상태)를 props로 추가로 받습니다.
export default function ProjectShowInAllToggle({ 
  id, 
  initialShowInAll, 
  isParentVisible 
}: { 
  id: number; 
  initialShowInAll: number;
  isParentVisible: number; 
}) {
  const [showInAll, setShowInAll] = useState(Number(initialShowInAll));
  const [isLoading, setIsLoading] = useState(false);

  // 💡 메인 Visible이 0(꺼짐)이면 이 토글은 작동하지 않도록 설정합니다.
  const isDisabled = Number(isParentVisible) === 0;

  const toggle = async () => {
    // 💡 로딩 중이거나, 메인 Visible이 꺼져있으면 클릭 무시
    if (isLoading || isDisabled) return;

    const newShowInAll = showInAll === 1 ? 0 : 1;
    
    // UI 즉시 반영
    setShowInAll(newShowInAll);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // 서버의 PUT 함수가 구분할 수 있도록 키값을 'showInAll'로 보냅니다.
        body: JSON.stringify({ showInAll: newShowInAll }), 
      });

      if (!res.ok) throw new Error();
    } catch (error) {
      // 실패 시 롤백
      setShowInAll(showInAll);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      // 💡 isDisabled 상태일 때 HTML 버튼 자체를 비활성화합니다.
      disabled={isLoading || isDisabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        showInAll === 1 && !isDisabled ? "bg-purple-600" : "bg-gray-200"
      } ${isLoading || isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          showInAll === 1 ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}