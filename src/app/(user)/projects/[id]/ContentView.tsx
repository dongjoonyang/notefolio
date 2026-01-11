'use client';

import { useState, useEffect } from 'react';
import ImageModal from '@/components/ImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/Skeleton';

// ✅ Props 타입에 loadingOverlay를 추가했습니다.
export default function ContentView({ 
  html, 
  loadingOverlay 
}: { 
  html: string; 
  loadingOverlay?: React.ReactNode 
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
      {/* ✅ isLoading이 true일 때 부모로부터 받은 로딩 오버레이를 보여줍니다. */}
      {isLoading && loadingOverlay}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Skeleton className="h-4 w-full dark:bg-zinc-800" />
            <Skeleton className="h-4 w-[90%] dark:bg-zinc-800" />
            <Skeleton className="h-72 w-full rounded-2xl dark:bg-zinc-800" /> 
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose-custom w-full cursor-zoom-in"
            onClick={handleImageClick}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </AnimatePresence>
      <ImageModal src={selectedImg} onClose={() => setSelectedImg(null)} />
    </div>
  );
}