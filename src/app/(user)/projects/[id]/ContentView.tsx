'use client';

import { useState, useEffect } from 'react';
import ImageModal from '@/components/ImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/Skeleton';
import ProjectActions from '@/components/ProjectActions'; // 1. 임포트 추가

export default function ContentView({ 
  html, 
  loadingOverlay,
  projectId // 2. projectId 추가
}: { 
  html: string; 
  loadingOverlay?: React.ReactNode;
  projectId: number; // 타입 추가
}) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleImageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImg((target as HTMLImageElement).src);
    }
  };

  return (
    <div className="w-full">
      {isLoading && loadingOverlay}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Skeleton className="h-4 w-full dark:bg-zinc-800" />
            <Skeleton className="h-4 w-[90%] dark:bg-zinc-800" />
            <Skeleton className="h-72 w-full rounded-2xl dark:bg-zinc-800" /> 
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <div
              className="prose-custom w-full cursor-zoom-in"
              onClick={handleImageClick}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            
            {/* 3. 콘텐츠가 끝나는 지점에 좋아요/공유 버튼 배치 */}
            <ProjectActions projectId={projectId} />
          </motion.div>
        )}
      </AnimatePresence>
      <ImageModal src={selectedImg} onClose={() => setSelectedImg(null)} />
    </div>
  );
}