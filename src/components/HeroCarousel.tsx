import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { BannerSlide } from '../types/foundation';
import { getNextSlideIndex, getPrevSlideIndex } from '../utils/bannerOrder';
import { SafeImage } from './SafeImage';

interface HeroCarouselProps {
  slides: BannerSlide[];
  onNavigate: (path: string) => void;
}

export function HeroCarousel({ slides, onNavigate }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides.length;
  const safeIndex = total > 0 ? activeIndex % total : 0;
  const activeSlide = slides[safeIndex];

  useEffect(() => {
    if (paused || total <= 1) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => getNextSlideIndex(prev, total));
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  if (!activeSlide) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="rounded-xl border border-[#E2DFD5] bg-[#EFECE4] h-[420px] flex items-center justify-center text-[#57606A]">
          Memuat galeri utama...
        </div>
      </section>
    );
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sorotan Program Yayasan Nata Bahari"
      className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative rounded-xl overflow-hidden border border-[#E2DFD5] bg-[#18222F]">
        <div className="relative h-[440px] sm:h-[520px] lg:h-[580px] w-full">
          {slides.map((slide, index) => {
            const isActive = index === safeIndex;
            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <SafeImage
                  src={slide.imageUrl}
                  alt={slide.title}
                  fallbackTitle={slide.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30"
                  aria-hidden="true"
                />
              </div>
            );
          })}

          {/* Overlay Slide Content */}
          <div className="relative z-20 h-full flex flex-col justify-between p-5 sm:p-10 lg:p-12 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs tracking-wide text-white/95 min-w-0">
                <span className="font-mono tabular-nums font-medium whitespace-nowrap shrink-0">
                  {String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="shrink-0">·</span>
                <span className="truncate">{activeSlide.kicker}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Lanjutkan putar otomatis' : 'Jeda putar otomatis'}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-black/45 hover:bg-black/65 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => getPrevSlideIndex(prev, total))}
                  aria-label="Slide sebelumnya"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-black/45 hover:bg-black/65 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => getNextSlideIndex(prev, total))}
                  aria-label="Slide berikutnya"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-black/45 hover:bg-black/65 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-w-2xl space-y-4">
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold leading-[1.12] tracking-tight text-white">
                {activeSlide.title}
              </h1>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl">
                {activeSlide.subtitle}
              </p>
              <div className="pt-1">
                <a
                  href={activeSlide.ctaHref}
                  onClick={(e) => {
                    if (activeSlide.ctaHref.startsWith('/')) {
                      e.preventDefault();
                      onNavigate(activeSlide.ctaHref);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#18222F] bg-white rounded-md hover:bg-[#F3F1EA] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>{activeSlide.ctaLabel || 'Jelajahi Program'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 8-Slide Direct Index Selector Strip */}
        <div
          role="tablist"
          aria-label="Pilih slide banner"
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border-t border-white/10 bg-[#131C26]"
        >
          {slides.map((slide, index) => {
            const isSelected = index === safeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Slide ${index + 1}: ${slide.kicker}`}
                onClick={() => setActiveIndex(index)}
                className={`text-left px-3 py-2.5 border-r border-b lg:border-b-0 border-white/10 last:border-r-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white ${
                  isSelected
                    ? 'bg-[#0F4C81] text-white'
                    : 'bg-[#131C26] text-white/75 hover:bg-[#1B2735] hover:text-white'
                }`}
              >
                <span className="block font-mono tabular-nums text-[11px] opacity-75">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="block text-[11.5px] font-medium truncate mt-0.5">
                  {slide.kicker}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
