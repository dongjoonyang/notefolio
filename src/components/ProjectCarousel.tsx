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
    /* 💡 수정됨: 요청하신 이미지와 동일한 배경색(#21282a) 적용 */
    <div className="relative group mx-[-32px] md:mx-[-40px] px-8 md:px-10 py-16 bg-[#21282a] border-y border-[#2a3437]">
      
      {/* 💡 타이틀: 흰색 유지 */}
      <div className="mb-10">
        <h3 className="text-[20px] font-black text-white uppercase tracking-tight">
          이런 프로젝트는 어때요?
        </h3>
      </div>

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
            <Link href={`/projects/${rec.id}`} replace className="group/item relative block overflow-hidden rounded-2xl border border-white/10 bg-[#2a3437] aspect-[16/10]">
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
          <button className="swiper-prev-btn absolute left-4 top-[60%] -translate-y-1/2 z-20 w-11 h-11 bg-white/10 hover:bg-white border border-white/20 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 disabled:!opacity-0 transition-all text-white hover:text-[#21282a]">
            <ChevronLeft size={22} />
          </button>
          
          <button className="swiper-next-btn absolute right-4 top-[60%] -translate-y-1/2 z-20 w-11 h-11 bg-white/10 hover:bg-white border border-white/20 rounded-full flex items-center justify-center shadow-2xl opacity-100 group-hover:scale-105 disabled:!opacity-0 transition-all text-white hover:text-[#21282a]">
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