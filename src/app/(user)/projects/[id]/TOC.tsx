"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

export default function TOC() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isBottom, setIsBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateHeadings = useCallback(() => {
    const contentArea = document.querySelector(".prose-custom");
    if (!contentArea) return;

    const elements = Array.from(contentArea.querySelectorAll("h2, h3")).map((elem) => {
      const text = elem.textContent?.trim() || "";
      const id = elem.id || text.replace(/\s+/g, "-").toLowerCase();
      elem.id = id;
      return { id, text, level: Number(elem.tagName.substring(1)) };
    });
    
    if (elements.length > 0) setHeadings(elements);
  }, []);

  useEffect(() => {
    setMounted(true);
    updateHeadings();

    const interval = setInterval(() => {
      const content = document.querySelector(".prose-custom h2, .prose-custom h3");
      if (content) {
        updateHeadings();
        clearInterval(interval);
      }
    }, 100);

    const activeObserver = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) => 
            prev.boundingClientRect.y < curr.boundingClientRect.y ? prev : curr
          );
          setActiveId(topEntry.target.id);
        }
      },
      { rootMargin: "-120px 0% -70% 0%", threshold: 0 }
    );

    const bottomObserver = new IntersectionObserver(
      (entries) => setIsBottom(entries[0].isIntersecting),
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    const targets = document.querySelectorAll(".prose-custom h2, .prose-custom h3");
    targets.forEach((h) => activeObserver.observe(h));
    
    const footerArea = document.querySelector(".comment-section");
    if (footerArea) bottomObserver.observe(footerArea);

    return () => {
      clearInterval(interval);
      activeObserver.disconnect();
      bottomObserver.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [updateHeadings, headings.length]);

  if (!mounted || headings.length === 0) return null;

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      isScrollingRef.current = true;
      setActiveId(id);
      const offset = 100;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setIsOpen(false);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  return (
    <>
      <nav className={`relative pl-4 transition-all duration-300 ${isBottom ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        {/* ✅ 왼쪽 세로줄: gray-100 -> dark:zinc-800 */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-100 dark:bg-zinc-800 rounded-full" />
        
        {/* ✅ 소제목: gray-400 -> dark:zinc-500 */}
        <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-6 ml-2 select-none">
          On this page
        </p>
        
        <ul className="relative flex flex-col gap-1">
          {headings.map((h) => (
            <li key={h.id} className="relative py-1">
              {activeId === h.id && (
                <motion.div
                  layoutId="active-toc-indicator"
                  // ✅ 인디케이터 색상: blue-600 -> dark:zinc-100 (다크모드에선 밝게)
                  className="absolute -left-[17px] w-[2px] bg-zinc-900 dark:bg-zinc-100 rounded-full z-10"
                  style={{ height: "20px", top: "calc(50% - 10px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <a
                href={`#${h.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(h.id); }}
                // ✅ 텍스트 색상: 활성/비활성 상태별 다크모드 대응
                className={`text-sm block px-2 transition-all duration-300 outline-none ${
                  activeId === h.id 
                    ? "text-zinc-900 dark:text-zinc-50 font-bold translate-x-1" 
                    : "text-gray-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                } ${h.level === 3 ? "pl-6 text-[13px]" : "pl-2"}`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}