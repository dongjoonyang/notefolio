'use client';

import { useState, useEffect } from 'react';
import { Heart, Share2, Check } from 'lucide-react';
import { toggleProjectLike, getLikeStatus } from '@/lib/actions';

export default function ProjectActions({ projectId }: { projectId: number }) {
  const [likeInfo, setLikeInfo] = useState({ count: 0, isLiked: false });
  const [isCopied, setIsCopied] = useState(false);

  // 초기 좋아요 상태 로드
  useEffect(() => {
    getLikeStatus(projectId).then(setLikeInfo);
  }, [projectId]);

  // 좋아요 클릭 핸들러
  const handleLike = async () => {
    const res = await toggleProjectLike(projectId);
    if (res.success) {
      // 서버 결과를 기다리지 않고 UI를 즉시 업데이트 (Optimistic UI)
      setLikeInfo((prev) => ({
        count: res.action === 'liked' ? prev.count + 1 : prev.count - 1,
        isLiked: res.action === 'liked',
      }));
    }
  };

  // 공유하기(링크 복사) 핸들러
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 py-10 border-t border-gray-100 dark:border-zinc-800 mt-10">
      {/* 좋아요 버튼 */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 ${
          likeInfo.isLiked
            ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
            : 'bg-gray-50 text-gray-500 dark:bg-zinc-900 dark:text-zinc-400'
        }`}
      >
        <Heart size={18} fill={likeInfo.isLiked ? 'currentColor' : 'none'} />
        <span className="text-sm font-bold">{likeInfo.count}</span>
      </button>

      {/* 공유하기 버튼 */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 transition-all active:scale-95"
      >
        {isCopied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
        <span className="text-sm font-bold">{isCopied ? '복사됨!' : '공유하기'}</span>
      </button>
    </div>
  );
}