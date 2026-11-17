import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { PortfolioPost } from '../../types/foundation';
import {
  createPortfolioPost,
  deletePortfolioPost,
  updatePortfolioPost,
} from '../../utils/api';
import { validatePortfolioPostInput } from '../../utils/validation';
import { SafeImage } from '../SafeImage';
import { ImagePickerField } from './ImagePickerField';

interface AdminPortfolioPanelProps {
  posts: PortfolioPost[];
  onPostsUpdated: (posts: PortfolioPost[]) => void;
}

const DEFAULT_CATEGORIES = [
  'Restorasi Karang',
  'Mangrove & Karbon Biru',
  'Edukasi Bahari',
  'Komunitas Pesisir',
  'Ekspedisi Riset',
  'Konservasi Satwa',
];

export function AdminPortfolioPanel({ posts, onPostsUpdated }: AdminPortfolioPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [formState, setFormState] = useState({
    title: '',
    category: DEFAULT_CATEGORIES[0],
    location: '',
    activityDate: new Date().toISOString().slice(0, 10),
    imageUrl: '/src/assets/images/hero_coral_reef_1794819970201.jpg',
    description: '',
  });

  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setFormState({
      title: '',
      category: DEFAULT_CATEGORIES[0],
      location: '',
      activityDate: new Date().toISOString().slice(0, 10),
      imageUrl: '/src/assets/images/hero_coral_reef_1794819970201.jpg',
      description: '',
    });
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setShowCreate(true);
    setErrorMessage('');
    setStatusMessage('');
  };

  const openEdit = (post: PortfolioPost) => {
    setShowCreate(false);
    setEditingId(post.id);
    setFormState({
      title: post.title,
      category: post.category,
      location: post.location,
      activityDate: post.activityDate,
      imageUrl: post.imageUrl,
      description: post.description,
    });
    setErrorMessage('');
    setStatusMessage('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const check = validatePortfolioPostInput(formState);
    if (!check.valid) {
      setErrorMessage(check.error || 'Data aktivitas tidak lengkap.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      if (editingId !== null) {
        const res = await updatePortfolioPost(editingId, formState);
        onPostsUpdated(res.posts);
        setEditingId(null);
        setStatusMessage('Postingan aktivitas berhasil diperbarui.');
      } else {
        const res = await createPortfolioPost(formState);
        onPostsUpdated(res.posts);
        setShowCreate(false);
        resetForm();
        setStatusMessage('Postingan aktivitas baru berhasil dipublikasikan.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan postingan.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (post: PortfolioPost) => {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await deletePortfolioPost(post.id);
      onPostsUpdated(res.posts);
      if (editingId === post.id) setEditingId(null);
      setStatusMessage(`Postingan "${post.title}" telah dihapus.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menghapus postingan.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Manajemen Portofolio Aktivitas ({posts.length})
          </h2>
          <p className="text-sm text-slate-600">
            Tambah, ubah, atau hapus dokumentasi aktivitas lapangan yang tampil di feed Portofolio publik.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Tambah Aktivitas</span>
        </button>
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

      {(showCreate || editingId !== null) && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingId !== null ? 'Edit Postingan Aktivitas' : 'Publikasikan Aktivitas Baru'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
              aria-label="Tutup formulir aktivitas"
              className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ImagePickerField
            id="post-image-input"
            label="Foto Dokumentasi Aktivitas"
            value={formState.imageUrl}
            onChange={(url) => setFormState((prev) => ({ ...prev, imageUrl: url }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-title" className="block text-xs font-medium text-slate-700 mb-1">
                Judul Aktivitas
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={formState.title}
                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Penanaman 500 Bibit Mangrove"
                className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="post-category" className="block text-xs font-medium text-slate-700 mb-1">
                Kategori Program
              </label>
              <select
                id="post-category"
                value={formState.category}
                onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-location" className="block text-xs font-medium text-slate-700 mb-1">
                Lokasi Kegiatan
              </label>
              <input
                id="post-location"
                type="text"
                value={formState.location}
                onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Wakatobi, Sulawesi Tenggara"
                className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="post-date" className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal Kegiatan
              </label>
              <input
                id="post-date"
                type="date"
                value={formState.activityDate}
                onChange={(e) => setFormState((prev) => ({ ...prev, activityDate: e.target.value }))}
                className="w-full h-9 px-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="post-description" className="block text-xs font-medium text-slate-700 mb-1">
              Deskripsi Aktivitas
            </label>
            <textarea
              id="post-description"
              rows={4}
              required
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tuliskan ringkasan kegiatan, jumlah peserta, dan dampak di lapangan..."
              className="w-full p-3 rounded-md bg-white border border-slate-300 text-sm text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] disabled:opacity-60 rounded-md cursor-pointer"
            >
              {busy ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Publikasikan Aktivitas'}
            </button>
          </div>
        </form>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3">
          <p className="text-sm font-medium text-slate-900">Belum ada postingan aktivitas</p>
          <p className="text-xs text-slate-500">Klik tombol Tambah Aktivitas untuk mempublikasikan dokumentasi pertama.</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="admin-posts-list">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-24 h-16 rounded overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <SafeImage
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-[#0F4C81]">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{post.activityDate}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => openEdit(post)}
                  aria-label={`Edit postingan ${post.title}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDelete(post)}
                  aria-label={`Hapus postingan ${post.title}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
