'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4"
    >
      ← 이전 목록으로 (필터 유지)
    </button>
  );
}