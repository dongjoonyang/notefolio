'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function ImageModal({ src, onClose }: { src: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 cursor-zoom-out p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt="확대 이미지"
              className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            />
            <button 
              onClick={onClose}
              className="absolute -top-10 right-0 text-white font-bold hover:text-gray-300 transition-colors"
            >
              닫기 ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}