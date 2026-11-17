import type { BannerSlide } from '../types/foundation';

export const HERO_SLIDE_COUNT = 8;

export function normalizeBannerOrders(slides: BannerSlide[]): BannerSlide[] {
  return slides.map((slide, index) => ({
    ...slide,
    sortOrder: index + 1,
  }));
}

export function moveBannerSlide(
  slides: BannerSlide[],
  slideId: number,
  direction: 'up' | 'down'
): BannerSlide[] {
  const ordered = [...slides].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentIndex = ordered.findIndex((s) => s.id === slideId);
  if (currentIndex === -1) return ordered;

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= ordered.length) {
    return ordered;
  }

  const next = [...ordered];
  const [moved] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, moved);

  return normalizeBannerOrders(next);
}

export function getNextSlideIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return (currentIndex + 1) % total;
}

export function getPrevSlideIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0;
  return (currentIndex - 1 + total) % total;
}
