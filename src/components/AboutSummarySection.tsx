import { ArrowRight } from 'lucide-react';
import type { AboutContent, PortfolioPost } from '../types/foundation';
import { SafeImage } from './SafeImage';

interface AboutSummarySectionProps {
  about: AboutContent;
  recentPosts: PortfolioPost[];
  onNavigate: (path: string) => void;
}

export function AboutSummarySection({
  about,
  recentPosts,
  onNavigate,
}: AboutSummarySectionProps) {
  const highlights = recentPosts.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Editorial About Summary */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="border-t border-b border-[#E2DFD5] py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-[#57606A]">
              Profil Singkat Yayasan
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#18222F] leading-tight">
              {about.summaryTitle}
            </h2>
            <div className="pt-2">
              <a
                href="/tentang-kita"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/tentang-kita');
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C81] hover:text-[#0B3961] transition-colors"
              >
                <span>Baca Selengkapnya di Tentang Kita</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <p className="text-base sm:text-lg text-[#374151] leading-relaxed max-w-prose first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#0F4C81]">
              {about.summaryBody}
            </p>

            {/* Claim-to-proof institutional footprint */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E2DFD5]">
              <div>
                <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#18222F]">
                  14.800+
                </p>
                <p className="text-xs text-[#57606A] mt-1">
                  Fragmen karang ditanam sejak 2019
                </p>
              </div>
              <div>
                <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#18222F]">
                  42 Desa
                </p>
                <p className="text-xs text-[#57606A] mt-1">
                  Komunitas pesisir mitra dampingan
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#18222F]">
                  3.250+
                </p>
                <p className="text-xs text-[#57606A] mt-1">
                  Pelajar pesisir peserta Sekolah Laut
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Field Portfolio Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#57606A]">
              Catatan Lapangan Terbaru
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18222F] mt-1">
              Dokumentasi Aktivitas Konservasi
            </h2>
          </div>
          <a
            href="/portfolio"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/portfolio');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81] hover:text-[#0B3961] whitespace-nowrap shrink-0"
          >
            <span>Lihat Semua Aktivitas</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((post) => (
            <article
              key={post.id}
              className="group bg-white border border-[#E2DFD5] rounded-lg overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#EFECE4]">
                <SafeImage
                  src={post.imageUrl}
                  alt={post.title}
                  fallbackTitle={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#57606A]">
                    <span className="font-medium text-[#0F4C81]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.location}</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#18222F] leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-3">
                    {post.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#F0EDE5] flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="font-mono tabular-nums">{post.activityDate}</span>
                  <a
                    href="/portfolio"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/portfolio');
                    }}
                    className="font-medium text-[#18222F] hover:text-[#0F4C81]"
                  >
                    Buka di Feed →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
