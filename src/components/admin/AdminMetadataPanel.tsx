import { useState, type FormEvent } from 'react';
import { Check, Copy, Globe } from 'lucide-react';
import type { OgType, SiteMetadata } from '../../types/foundation';
import { updateSiteMetadata } from '../../utils/api';
import { validateMetadataInput } from '../../utils/validation';
import { SafeImage } from '../SafeImage';
import { ImagePickerField } from './ImagePickerField';

interface AdminMetadataPanelProps {
  metadata: SiteMetadata;
  onMetadataUpdated: (metadata: SiteMetadata) => void;
}

export function AdminMetadataPanel({
  metadata,
  onMetadataUpdated,
}: AdminMetadataPanelProps) {
  const [form, setForm] = useState({
    siteTitle: metadata.siteTitle,
    siteDescription: metadata.siteDescription,
    ogTitle: metadata.ogTitle,
    ogDescription: metadata.ogDescription,
    ogImage: metadata.ogImage,
    ogType: metadata.ogType,
    ogSiteName: metadata.ogSiteName,
  });

  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSyncFromGlobal = () => {
    setForm((prev) => ({
      ...prev,
      ogTitle: prev.siteTitle,
      ogDescription: prev.siteDescription,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const check = validateMetadataInput(form);
    if (!check.valid) {
      setErrorMessage(check.error || 'Data metadata tidak valid.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const res = await updateSiteMetadata(form);
      onMetadataUpdated(res.metadata);
      setStatusMessage(
        'Konfigurasi metadata global dan tag OpenGraph berhasil disimpan ke situs.'
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan metadata.');
    } finally {
      setBusy(false);
    }
  };

  const titleLen = form.siteTitle.trim().length;
  const descLen = form.siteDescription.trim().length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Manajer Metadata & OpenGraph Situs
        </h2>
        <p className="text-sm text-slate-600">
          Kelola judul global (<code className="font-mono text-xs">&lt;title&gt;</code>), deskripsi mesin pencari, dan tag kartu sosial OpenGraph yang tersimpan permanen pada konfigurasi situs.
        </p>
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
        <div
          role="alert"
          className="px-4 py-2.5 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2.5">
              Metadata Global (SEO)
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="meta-site-title" className="block text-xs font-medium text-slate-700">
                  Judul Global Situs (&lt;title&gt;)
                </label>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">
                  {titleLen} / 120 karakter
                </span>
              </div>
              <input
                id="meta-site-title"
                type="text"
                required
                value={form.siteTitle}
                onChange={(e) => setForm((p) => ({ ...p, siteTitle: e.target.value }))}
                placeholder="Yayasan Nata Bahari — Konservasi Pesisir & Literasi Maritim"
                className="w-full h-10 px-3 rounded-md border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F4C81]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="meta-site-description" className="block text-xs font-medium text-slate-700">
                  Deskripsi Global (&lt;meta name=&quot;description&quot;&gt;)
                </label>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">
                  {descLen} / 320 karakter
                </span>
              </div>
              <textarea
                id="meta-site-description"
                rows={3}
                required
                value={form.siteDescription}
                onChange={(e) => setForm((p) => ({ ...p, siteDescription: e.target.value }))}
                className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F4C81]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-900">
                Tag OpenGraph & Kartu Berbagi Sosial
              </h3>
              <button
                type="button"
                onClick={handleSyncFromGlobal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F4C81] hover:text-[#0B3961] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Samakan dengan Judul & Deskripsi Global</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="meta-og-sitename" className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Situs (og:site_name)
                </label>
                <input
                  id="meta-og-sitename"
                  type="text"
                  required
                  value={form.ogSiteName}
                  onChange={(e) => setForm((p) => ({ ...p, ogSiteName: e.target.value }))}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="meta-og-type" className="block text-xs font-medium text-slate-700 mb-1">
                  Tipe OpenGraph (og:type)
                </label>
                <select
                  id="meta-og-type"
                  value={form.ogType}
                  onChange={(e) => setForm((p) => ({ ...p, ogType: e.target.value as OgType }))}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-900 bg-white"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="profile">profile</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="meta-og-title" className="block text-xs font-medium text-slate-700 mb-1">
                Judul OpenGraph (og:title)
              </label>
              <input
                id="meta-og-title"
                type="text"
                required
                value={form.ogTitle}
                onChange={(e) => setForm((p) => ({ ...p, ogTitle: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="meta-og-description" className="block text-xs font-medium text-slate-700 mb-1">
                Deskripsi OpenGraph (og:description)
              </label>
              <textarea
                id="meta-og-description"
                rows={2}
                required
                value={form.ogDescription}
                onChange={(e) => setForm((p) => ({ ...p, ogDescription: e.target.value }))}
                className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <ImagePickerField
              id="meta-og-image"
              label="Gambar Pratinjau OpenGraph (og:image)"
              value={form.ogImage}
              onChange={(url) => setForm((p) => ({ ...p, ogImage: url }))}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] disabled:opacity-60 rounded-md cursor-pointer"
            >
              {busy ? 'Menyimpan...' : 'Simpan Konfigurasi Metadata'}
            </button>
          </div>
        </form>

        {/* Live Search & OpenGraph Preview */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pratinjau Hasil Pencarian
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>natabahari.or.id</span>
              </div>
              <p className="text-base font-medium text-[#1a0dab] leading-snug">
                {form.siteTitle || 'Judul Situs'}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {form.siteDescription || 'Deskripsi situs akan tampil di sini.'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Pratinjau Kartu OpenGraph</span>
              <span className="font-mono text-[11px]">{form.ogType}</span>
            </div>
            <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
              <SafeImage
                src={form.ogImage}
                alt={form.ogTitle}
                fallbackTitle={form.ogSiteName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                {form.ogSiteName || 'Yayasan Nata Bahari'}
              </p>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {form.ogTitle || form.siteTitle}
              </p>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {form.ogDescription || form.siteDescription}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
