'use client';

import { useState, useEffect } from 'react';
import ImageModal from '@/components/ImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/Skeleton'; // Skeleton 컴포넌트 임포트

export default function ContentView({ html }: { html: string }) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 환경에서 너무 빨리 지나가면 시간을 800(0.8초) 정도로 늘려보세요.
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
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* 만들어두신 Skeleton 컴포넌트 활용 */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-72 w-full rounded-2xl" /> 
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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