"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export default function ProjectCarousel({ recommendations }: { recommendations: any[] }) {
  // 4개 초과일 때 내비게이션 활성화 여부 확인
  const isNavigationActive = recommendations.length > 4;

  return (
    <div className="relative group px-1">
      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={20}
        slidesPerView={1.2}
        freeMode={true}
        navigation={{
          nextEl: ".swiper-next-btn",
          prevEl: ".swiper-prev-btn",
        }}
        breakpoints={{
          640: { slidesPerView: 2, freeMode: false },
          1024: { slidesPerView: 4, freeMode: false },
        }}
        className="!static overflow-visible"
      >
        {recommendations.map((rec) => (
          <SwiperSlide key={rec.id} className="pb-4">
            <Link href={`/projects/${rec.id}`} replace className="group/item relative block overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 aspect-[16/10]">
              {/* 메인 이미지 */}
              <Image
                src={rec.thumbnail || "/placeholder.jpg"}
                alt={rec.title}
                fill
                className="object-cover transition-transform duration-700 group-hover/item:scale-110"
              />
              
              {/* 호버 시 나타나는 제목 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                <h4 className="text-white text-sm font-bold leading-snug translate-y-4 group-hover/item:translate-y-0 transition-transform duration-300 line-clamp-2">
                  {rec.title}
                </h4>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 내비게이션 화살표 */}
      {isNavigationActive && (
        <>
          {/* 왼쪽 화살표: 마우스 올렸을 때만 보임 */}
          <button className="swiper-prev-btn absolute left-[-22px] top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 disabled:!opacity-0 transition-all text-zinc-800 dark:text-zinc-200 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
            <ChevronLeft size={22} />
          </button>
          
          {/* 오른쪽 화살표: 처음부터 보임 (opacity-100) */}
          <button className="swiper-next-btn absolute right-[-22px] top-[40%] -translate-y-1/2 z-20 w-11 h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-xl opacity-100 group-hover:scale-105 disabled:!opacity-0 transition-all text-zinc-800 dark:text-zinc-200 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <style jsx global>{`
        .swiper-button-disabled {
          opacity: 0 !important;
          cursor: default;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}