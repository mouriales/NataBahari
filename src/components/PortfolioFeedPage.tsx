import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Check, Expand, MapPin, Search, Share2, X } from 'lucide-react';
import type { PortfolioPost } from '../types/foundation';
import { SafeImage } from './SafeImage';

interface PortfolioFeedPageProps {
  posts: PortfolioPost[];
}

export function PortfolioFeedPage({ posts }: PortfolioFeedPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [lightboxPost, setLightboxPost] = useState<PortfolioPost | null>(null);

  useEffect(() => {
    if (!lightboxPost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPost(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxPost]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category)));
    return ['Semua', ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const catMatch = selectedCategory === 'Semua' || post.category === selectedCategory;
      const textMatch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const copyShareUrl = (post: PortfolioPost) => {
    const shareUrl = `${window.location.origin}/portfolio#post-${post.id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => undefined);
    }
    setCopiedId(post.id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="space-y-3 border-b border-[#E2DFD5] pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-[#57606A]">
          Arsip Aktivitas Lapangan
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#18222F]">
          Portofolio Program Yayasan Nata Bahari
        </h1>
        <p className="text-base text-[#4B5563] leading-relaxed max-w-2xl">
          Lini masa kronologis kegiatan konservasi terumbu karang, restorasi mangrove, ekspedisi riset, dan sekolah pesisir bersama masyarakat mitra.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="py-6 space-y-4">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Cari aktivitas portofolio"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul aktivitas, lokasi, atau kata kunci..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E2DFD5] rounded-md text-sm text-[#18222F] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0F4C81]"
          />
        </div>

        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Filter kategori"
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#0F4C81] text-white'
                    : 'bg-[#EFECE4] text-[#374151] hover:bg-[#E2DFD5]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Social-Media-Feed Style Stream */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-[#E2DFD5] rounded-lg p-10 text-center space-y-3">
          <p className="font-serif text-xl font-medium text-[#18222F]">
            Belum ada aktivitas yang cocok
          </p>
          <p className="text-sm text-[#57606A]">
            Coba ubah filter kategori atau kata kunci pencarian Anda.
          </p>
          {(selectedCategory !== 'Semua' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] rounded-md hover:bg-[#0B3961] cursor-pointer"
            >
              Atur Ulang Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8" data-testid="portfolio-feed">
          {filteredPosts.map((post) => {
            const isSaved = savedIds.includes(post.id);
            const isCopied = copiedId === post.id;

            return (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="bg-white border border-[#E2DFD5] rounded-lg overflow-hidden"
              >
                {/* Social Feed Author / Context Header */}
                <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[#F2EFE8]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className="w-10 h-10 rounded-full bg-[#0F4C81] text-white font-serif font-semibold text-sm flex items-center justify-center shrink-0"
                    >
                      NB
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#18222F] truncate">
                        Yayasan Nata Bahari
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#57606A] flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" />
                          {post.location}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{post.activityDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#0F4C81] font-medium">{post.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Photo */}
                <div className="relative aspect-[16/10] bg-[#EFECE4] overflow-hidden group">
                  <SafeImage
                    src={post.imageUrl}
                    alt={post.title}
                    fallbackTitle={post.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setLightboxPost(post)}
                    aria-label={`Perbesar foto ${post.title}`}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-black/65 hover:bg-black/80 text-white text-xs font-medium inline-flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Expand className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Perbesar</span>
                  </button>
                </div>

                {/* Activity Title & Description */}
                <div className="p-5 sm:p-6 space-y-3">
                  <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#18222F] leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-[15px] text-[#374151] leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>

                  {/* Feed Action Bar */}
                  <div className="pt-4 border-t border-[#F2EFE8] flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSave(post.id)}
                      aria-pressed={isSaved}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-[#0F4C81]/10 text-[#0F4C81]'
                          : 'text-[#4B5563] hover:bg-[#F3F1EA]'
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                        aria-hidden="true"
                      />
                      <span>{isSaved ? 'Tersimpan' : 'Simpan Catatan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyShareUrl(post)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md text-[#4B5563] hover:bg-[#F3F1EA] transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                          <span className="text-emerald-700">Tautan Disalin</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" aria-hidden="true" />
                          <span>Salin Tautan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPost && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPost.title}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxPost(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#131C26] text-white rounded-lg overflow-hidden border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="min-w-0 pr-4">
                <p className="font-serif text-base font-medium truncate">
                  {lightboxPost.title}
                </p>
                <p className="text-xs text-white/65">
                  {lightboxPost.location} · {lightboxPost.activityDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPost(null)}
                aria-label="Tutup tampilan foto"
                className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
              <SafeImage
                src={lightboxPost.imageUrl}
                alt={lightboxPost.title}
                fallbackTitle={lightboxPost.title}
                className="w-full max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
