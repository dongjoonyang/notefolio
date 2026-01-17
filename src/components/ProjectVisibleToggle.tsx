"use client";

import { useState } from "react";

export default function ProjectVisibleToggle({ id, initialVisible }: { id: number; initialVisible: number }) {
  const [isVisible, setIsVisible] = useState(Number(initialVisible));
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    if (isLoading) return;
    const newVisible = isVisible === 1 ? 0 : 1;
    
    // 1. UI 즉각 반영
    setIsVisible(newVisible);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: newVisible }),
      });

      if (!res.ok) throw new Error();
    } catch (error) {
      // 실패 시 롤백
      setIsVisible(isVisible);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        isVisible === 1 ? "bg-black" : "bg-gray-200"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          isVisible === 1 ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}