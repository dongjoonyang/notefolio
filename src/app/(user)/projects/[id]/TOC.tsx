"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

export default function TOC() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isBottom, setIsBottom] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // ✅ 스크롤 감지 잠금용 Ref
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
        // ✅ 클릭 이동 중일 때는 Observer의 업데이트를 완전히 무시
        if (isScrollingRef.current) return;

        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // 가장 상단에 있는 요소를 활성화
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
      // ✅ 1. 이전 타임아웃 제거 및 잠금 설정
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      isScrollingRef.current = true;
      
      // ✅ 2. 즉시 ID 변경 (바가 즉시 이동하게 함)
      setActiveId(id);

      const offset = 100;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      window.history.pushState(null, "", `#${id}`);
      setIsOpen(false);

      // ✅ 3. 스크롤이 확실히 멈춘 뒤에만 잠금을 풂 (시간을 넉넉히 1초)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  return (
    <>
      <nav className={`relative pl-4 transition-opacity duration-300 ${isBottom ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-100 rounded-full" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2 select-none">
          On this page
        </p>
        
        <ul className="relative flex flex-col gap-1">
          {headings.map((h) => (
            <li key={h.id} className="relative py-1">
              {/* ✅ AnimatePresence를 빼고 motion.div만 사용하여 layoutId의 안정성을 높임 */}
              {activeId === h.id && (
                <motion.div
                  layoutId="active-toc-indicator"
                  className="absolute -left-[17px] w-[2px] bg-blue-600 rounded-full z-10"
                  style={{ height: "20px", top: "calc(50% - 10px)" }}
                  // 스프링 효과를 조금 더 묵직하게 조절 (튀는 현상 방지)
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <a
                href={`#${h.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(h.id); }}
                className={`text-sm block px-2 transition-all duration-300 outline-none ${
                  activeId === h.id 
                    ? "text-blue-600 font-bold translate-x-1" 
                    : "text-gray-400 hover:text-gray-900"
                } ${h.level === 3 ? "pl-6 text-[13px]" : "pl-2"}`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* 모바일 버튼 등은 기존과 동일하게 유지 */}
    </>
  );
}