'use client';

import { useState, useEffect } from 'react';

/* ================================================
   1. Hero Section
   ================================================ */
function HeroSection() {
  return (
    <section className="bg-white py-24 px-6 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl lg:text-[2.5rem] font-bold leading-tight text-[#0d0d0d] mb-6">
            아이디어의 시각화
            <br />
            기획 구조 잡기
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
            서비스의 구조를 한눈에 파악할 수 있도록 피그마로
            <br />
            화면 설계서와 유저 플로우(User Flow)를 제작합니다.
          </p>
        </div>

        {/* Right: Product screenshot */}
        <div className="flex-1 w-full">
          <img
            src="/images/figma1.png"
            alt="피그마 설계도 스크린샷"
            className="w-full rounded-2xl border border-gray-200 object-cover"
          />
        </div>
      </div>
    </section>
  );
}


/* ================================================
   3. Industry Carousel
   ================================================ */



/* ================================================
   8. Case Study (Virgin Mobile UAE)
   ================================================ */
function CaseStudySection() {
  return (
    <section className="bg-gray-50 py-20 px-6 border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Screenshot */}
          <div className="flex-1 w-full">
            <img
              src="/images/webstorm1.png"
              alt="웹스톰 인터페이스 스크린샷"
              className="w-full rounded-2xl border border-gray-200 object-cover"
            />
          </div>

          {/* Right: Text */}
          <div className="flex-1 text-right">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0d0d] leading-tight mb-4">
              실제 코드가 돌아갈
              <br />
              안정적인 환경 구축
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              강력한 IDE인 웹스톰을 활용해, 입문자도 프로처럼
              <br />
              코드를 관리하고 실행해 보는 경험을 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================
   9. Code Examples
   ================================================ */
function CodeSection() {

  return (
    <section className="bg-white py-20 px-6 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0d0d] mb-4">
            설계도를 바탕으로
            <br />
            실제 기능 구현
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md">
            비용 부담 없이 제미나이의 무료 티어를 활용하여, 앞서 설계한 기획안을 실제 작동하는 서비스 엔진으로 바꿉니다.
          </p>
        </div>

        {/* Right: Gemini image */}
        <div className="flex-1 w-full">
          <img
            src="/images/gemini1.png"
            alt="제미나이 에이전트 화면"
            className="w-full rounded-2xl border border-gray-200 object-cover"
          />
        </div>
      </div>
    </section>
  );
}


/* ================================================
   12. Bottom CTA
   ================================================ */
function BottomCTASection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-[#0d0d0d] mb-6 leading-tight">
          머릿속에만 있던 내 아이디어,
          <br />
          직접 구현해 볼까요?
        </h2>
        <p className="text-gray-500 text-lg mb-10 leading-relaxed">
          기술을 몰라도 괜찮습니다.
          <br />
          AI와 대화하며 서비스의 뼈대를 세우는 특별한 경험을 시작합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/all" className="bg-[#6210cc] hover:bg-[#5209b0] text-white px-10 py-4 rounded-lg font-semibold transition-colors">
            전체 프로젝트 보기
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================================
   [2단계 추가] Process Steps Section
   ================================================ */
const processSteps = [
  {
    step: '1단계',
    tag: 'Plan',
    title: '피그마(figma) —\n디자인툴',
    role: '아이디어의 시각화 및 기획 구조 잡기',
    point:
      '서비스의 구성과 동선을 그리는 \'설계도\'를 준비하세요. 논리적인 설계도가 갖춰질 때 비로소 AI를 통한 정확한 구현이 가능해집니다.',
    color: 'bg-violet-50 border-violet-200',
    tagColor: 'bg-violet-100 text-violet-700',
    iconBg: 'bg-violet-600',
  },
  {
    step: '2단계',
    tag: 'Build',
    title: '전문가의 작업실 세팅 —\n웹스톰(WebStorm)',
    role: '실제 코드가 돌아갈 안정적인 환경 구축',
    point:
      '강력한 IDE인 웹스톰을 활용해, 입문자도 프로처럼 코드를 관리하고 실행해 보는 경험을 제공합니다.',
    color: 'bg-blue-50 border-blue-200',
    tagColor: 'bg-blue-100 text-blue-700',
    iconBg: 'bg-blue-600',
  },
  {
    step: '3단계',
    tag: 'Run',
    title: 'AI로 생명력 불어넣기 —\n제미나이 에이전트(Gemini)',
    role: '설계도를 바탕으로 실제 기능 구현 (무료 활용)',
    point:
      '비용 부담 없이 제미나이의 무료 티어를 활용하여, 앞서 설계한 기획안을 실제 작동하는 서비스 엔진으로 바꿉니다.',
    color: 'bg-emerald-50 border-emerald-200',
    tagColor: 'bg-emerald-100 text-emerald-700',
    iconBg: 'bg-emerald-600',
  },
];

const slideImages = [
  { src: '/images/figma1.png', label: 'Plan', desc: '피그마로 상상을 구체화합니다.' },
  { src: '/images/webstorm1.png', label: 'Build', desc: '웹스톰에서 기반을 닦습니다.' },
  { src: '/images/gemini1.png', label: 'Run', desc: '제미나이로 서비스를 완성합니다.' },
];

function ProcessStepsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-white py-24 px-6 border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#6210cc] text-sm font-semibold uppercase tracking-widest mb-3">
            툴 학습이 아닌, 프로세스의 경험
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0d0d0d] mb-4">
            단계별로 서비스를 만드는 방법
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            기획부터 배포까지, 검증된 3단계 프로세스로 아이디어를
            <br />
            실제 작동하는 서비스로 완성하세요.
          </p>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {processSteps.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-8 ${s.color} relative overflow-hidden`}
            >
              {/* Step badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.tagColor}`}>
                  {s.tag}
                </span>
                <span className="text-xs text-gray-400 font-medium">{s.step}</span>
              </div>

              {/* Number */}
              <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                <span className="text-white font-black text-lg">{i + 1}</span>
              </div>

              <h3 className="font-bold text-[#0d0d0d] text-lg mb-2 leading-snug whitespace-pre-line">{s.title}</h3>


              <p className="text-sm text-gray-600 leading-relaxed">
                {s.point}
              </p>

              {/* Connector arrow (between cards) */}
              {i < processSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-gray-400 text-xs">→</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Visual Flow Image Area */}
        <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-gray-200">
            {slideImages.map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`px-6 py-5 text-center transition-colors ${i < 2 ? 'border-r border-gray-200' : ''} ${
                  currentSlide === i ? 'bg-white' : 'hover:bg-gray-100'
                }`}
              >
                <p className={`text-xs font-bold mb-1 transition-colors ${currentSlide === i ? 'text-[#6210cc]' : 'text-gray-400'}`}>
                  {i + 1}. {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.desc}</p>
                {/* Active indicator bar */}
                {currentSlide === i && (
                  <div className="mt-2 h-0.5 bg-[#6210cc] rounded-full mx-auto w-8" />
                )}
              </button>
            ))}
          </div>

          {/* Slideshow */}
          <div className="mx-6 my-6 overflow-hidden rounded-2xl border border-gray-200">
            <img
              src={slideImages[currentSlide].src}
              alt={slideImages[currentSlide].label}
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================
   Page Export
   ================================================ */
export default function SendbirdCustomerSupportPage() {
  return (
    <main>
      <HeroSection />
      <CaseStudySection />
      <CodeSection />
      <ProcessStepsSection />
      <BottomCTASection />
    </main>
  );
}
