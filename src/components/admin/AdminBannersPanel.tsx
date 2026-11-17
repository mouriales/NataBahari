import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Pencil, X } from 'lucide-react';
import type { BannerSlide } from '../../types/foundation';
import { reorderBannerSlides, updateBannerSlide } from '../../utils/api';
import { moveBannerSlide } from '../../utils/bannerOrder';
import { validateBannerInput } from '../../utils/validation';
import { SafeImage } from '../SafeImage';
import { ImagePickerField } from './ImagePickerField';

interface AdminBannersPanelProps {
  banners: BannerSlide[];
  onBannersUpdated: (banners: BannerSlide[]) => void;
}

export function AdminBannersPanel({ banners, onBannersUpdated }: AdminBannersPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState({
    kicker: '',
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaLabel: '',
    ctaHref: '',
  });
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const orderedBanners = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  const startEdit = (slide: BannerSlide) => {
    setEditingId(slide.id);
    setDraft({
      kicker: slide.kicker,
      title: slide.title,
      subtitle: slide.subtitle,
      imageUrl: slide.imageUrl,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
    });
    setErrorMessage('');
    setStatusMessage('');
  };

  const handleMove = async (slideId: number, direction: 'up' | 'down') => {
    const reordered = moveBannerSlide(orderedBanners, slideId, direction);
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await reorderBannerSlides(reordered.map((b) => b.id));
      onBannersUpdated(res.banners);
      setStatusMessage('Urutan slide carousel berhasil diperbarui.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengubah urutan slide.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSlide = async (slideId: number) => {
    const check = validateBannerInput(draft);
    if (!check.valid) {
      setErrorMessage(check.error || 'Data slide tidak valid.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await updateBannerSlide(slideId, draft);
      onBannersUpdated(res.banners);
      setEditingId(null);
      setStatusMessage('Perubahan slide banner telah disimpan.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan slide.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Manajemen Carousel Beranda ({orderedBanners.length} Slide)
          </h2>
          <p className="text-sm text-slate-600">
            Unggah, ganti gambar, perbarui teks, dan atur ulang urutan 8 slide hero pada halaman utama.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="px-4 py-2.5 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3" data-testid="admin-banners-list">
        {orderedBanners.map((slide, idx) => {
          const isEditing = editingId === slide.id;
          return (
            <div
              key={slide.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden"
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-mono tabular-nums text-xs font-semibold text-slate-500 w-7 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="w-28 h-16 rounded overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <SafeImage
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#0F4C81] truncate">
                      {slide.kicker}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {slide.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate max-w-xl">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    disabled={busy || idx === 0}
                    onClick={() => handleMove(slide.id, 'up')}
                    aria-label={`Naikkan urutan slide ${idx + 1}: ${slide.title}`}
                    className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busy || idx === orderedBanners.length - 1}
                    onClick={() => handleMove(slide.id, 'down')}
                    aria-label={`Turunkan urutan slide ${idx + 1}: ${slide.title}`}
                    className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center text-slate-700 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label={`Batal ubah slide ${idx + 1}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Tutup</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(slide)}
                      aria-label={`Ubah slide ${idx + 1}: ${slide.title}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Edit Slide</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
                  <ImagePickerField
                    id={`banner-img-${slide.id}`}
                    label="Gambar Banner (16:9)"
                    value={draft.imageUrl}
                    onChange={(url) => setDraft((prev) => ({ ...prev, imageUrl: url }))}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`banner-kicker-${slide.id}`} className="block text-xs font-medium text-slate-700 mb-1">
                        Label Kategori Slide
                      </label>
                      <input
                        id={`banner-kicker-${slide.id}`}
                        type="text"
                        value={draft.kicker}
                        onChange={(e) => setDraft((prev) => ({ ...prev, kicker: e.target.value }))}
                        className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor={`banner-title-${slide.id}`} className="block text-xs font-medium text-slate-700 mb-1">
                        Judul Utama Slide
                      </label>
                      <input
                        id={`banner-title-${slide.id}`}
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`banner-subtitle-${slide.id}`} className="block text-xs font-medium text-slate-700 mb-1">
                      Deskripsi Singkat
                    </label>
                    <textarea
                      id={`banner-subtitle-${slide.id}`}
                      rows={2}
                      value={draft.subtitle}
                      onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full p-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`banner-cta-label-${slide.id}`} className="block text-xs font-medium text-slate-700 mb-1">
                        Teks Tombol CTA
                      </label>
                      <input
                        id={`banner-cta-label-${slide.id}`}
                        type="text"
                        value={draft.ctaLabel}
                        onChange={(e) => setDraft((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                        className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor={`banner-cta-href-${slide.id}`} className="block text-xs font-medium text-slate-700 mb-1">
                        Tujuan Tautan CTA
                      </label>
                      <input
                        id={`banner-cta-href-${slide.id}`}
                        type="text"
                        value={draft.ctaHref}
                        onChange={(e) => setDraft((prev) => ({ ...prev, ctaHref: e.target.value }))}
                        className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSaveSlide(slide.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] disabled:opacity-60 rounded-md cursor-pointer"
                    >
                      {busy ? 'Menyimpan...' : 'Simpan Slide'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
