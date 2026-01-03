"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TOC() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isBottom, setIsBottom] = useState(false); // 댓글창 도달 여부
  const [isOpen, setIsOpen] = useState(false); // 모바일 메뉴 열림 상태

  useEffect(() => {
    const contentArea = document.querySelector(".prose-custom");
    const footerArea = document.querySelector(".comment-section"); // 댓글 섹션 클래스 추가 필요
    if (!contentArea) return;

    const queryHeadings = () => {
      const elements = Array.from(contentArea.querySelectorAll("h2, h3")).map((elem) => {
        const text = elem.textContent?.trim() || "";
        const id = elem.id || text.replace(/\s+/g, "-").toLowerCase();
        elem.id = id;
        return { id, text, level: Number(elem.tagName.substring(1)) };
      });
      setHeadings(elements);
    };
    queryHeadings();

    // 1. 목차 활성화 감지
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) => 
            prev.boundingClientRect.y < curr.boundingClientRect.y ? prev : curr
          );
          setActiveId(topEntry.target.id);
        }
      },
      { rootMargin: "-100px 0% -70% 0%", threshold: 0 }
    );

    // 2. 하단 댓글 섹션 감지 (TOC 멈춤용)
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsBottom(entry.isIntersecting);
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    contentArea.querySelectorAll("h2, h3").forEach((h) => activeObserver.observe(h));
    if (footerArea) bottomObserver.observe(footerArea);

    return () => {
      activeObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      window.history.pushState(null, "", `#${id}`);
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* --- 데스크톱 버전 --- */}
      <nav className={`relative pl-4 transition-opacity duration-300 ${isBottom ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-100 rounded-full" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2 select-none">
          On this page
        </p>
        <ul className="relative flex flex-col gap-1">
          {headings.map((h) => (
            <li key={h.id} className="relative group py-1">
              {activeId === h.id && (
                <motion.div
                  layoutId="active-toc-indicator-pc"
                  className="absolute -left-[17px] w-[2px] bg-blue-600 rounded-full z-10"
                  style={{ height: "20px", top: "calc(50% - 10px)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <a
                href={`#${h.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(h.id); }}
                className={`text-sm block px-2 transition-all duration-300 ${
                  activeId === h.id ? "text-blue-600 font-bold translate-x-1" : "text-gray-400 hover:text-gray-900"
                } ${h.level === 3 ? "pl-6 text-[13px]" : "pl-2"}`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- 모바일 플로팅 버튼 --- */}
      <div className="xl:hidden fixed bottom-8 right-6 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
              />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-16 right-0 bg-white p-6 rounded-3xl shadow-2xl w-[70vw] max-w-[300px] border border-gray-100"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">목차</p>
                <ul className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <button
                        onClick={() => scrollTo(h.id)}
                        className={`text-left text-sm font-medium transition-colors ${activeId === h.id ? "text-blue-600" : "text-gray-600"}`}
                      >
                        {h.level === 3 && <span className="mr-2 text-gray-300">ㄴ</span>}
                        {h.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}