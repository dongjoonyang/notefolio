'use client';

import { useState, useEffect } from 'react';
import ImageModal from '@/components/ImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/Skeleton';

export default function ContentView({ html }: { html: string }) {
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
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* ✅ 스켈레톤: dark:bg-zinc-800 클래스만 추가했습니다. */}
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