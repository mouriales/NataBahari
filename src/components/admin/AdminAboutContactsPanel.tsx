import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { AboutContent, ContactEntry } from '../../types/foundation';
import {
  createContactEntry,
  deleteContactEntry,
  updateAboutContent,
  updateContactEntry,
} from '../../utils/api';
import { validateContactInput } from '../../utils/validation';
import { RichContactText } from '../RichContactText';

interface AdminAboutContactsPanelProps {
  about: AboutContent;
  contacts: ContactEntry[];
  onAboutUpdated: (about: AboutContent) => void;
  onContactsUpdated: (contacts: ContactEntry[]) => void;
}

export function AdminAboutContactsPanel({
  about,
  contacts,
  onAboutUpdated,
  onContactsUpdated,
}: AdminAboutContactsPanelProps) {
  const [aboutForm, setAboutForm] = useState({
    summaryTitle: about.summaryTitle,
    summaryBody: about.summaryBody,
    visionTitle: about.visionTitle,
    visionBody: about.visionBody,
    missionTitle: about.missionTitle,
    missionItemsText: about.missionItems.join('\n'),
    backgroundTitle: about.backgroundTitle,
    backgroundBody: about.backgroundBody,
  });

  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [showNewContact, setShowNewContact] = useState(false);
  const [contactForm, setContactForm] = useState({ label: '', richText: '' });

  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSaveAbout = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const missionItems = aboutForm.missionItemsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const res = await updateAboutContent({
        summaryTitle: aboutForm.summaryTitle,
        summaryBody: aboutForm.summaryBody,
        visionTitle: aboutForm.visionTitle,
        visionBody: aboutForm.visionBody,
        missionTitle: aboutForm.missionTitle,
        missionItems,
        backgroundTitle: aboutForm.backgroundTitle,
        backgroundBody: aboutForm.backgroundBody,
      });
      onAboutUpdated(res.about);
      setStatusMessage('Konten Tentang Kita dan Ringkasan Beranda berhasil diperbarui.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal memperbarui konten.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveContact = async (e: FormEvent) => {
    e.preventDefault();
    const check = validateContactInput(contactForm);
    if (!check.valid) {
      setErrorMessage(check.error || 'Data kontak wajib diisi.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      if (editingContactId !== null) {
        const res = await updateContactEntry(editingContactId, contactForm);
        onContactsUpdated(res.contacts);
        setEditingContactId(null);
        setStatusMessage('Kontak interaktif berhasil diperbarui.');
      } else {
        const res = await createContactEntry(contactForm);
        onContactsUpdated(res.contacts);
        setShowNewContact(false);
        setContactForm({ label: '', richText: '' });
        setStatusMessage('Kontak interaktif baru berhasil ditambahkan.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan kontak.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await deleteContactEntry(id);
      onContactsUpdated(res.contacts);
      if (editingContactId === id) setEditingContactId(null);
      setStatusMessage('Entri kontak telah dihapus.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menghapus kontak.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Profil Tentang Kita & Kontak Interaktif
        </h2>
        <p className="text-sm text-slate-600">
          Sunting ringkasan beranda, visi, misi, latar belakang sejarah yayasan, serta tautan hiperteks pada bagian kontak.
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
        <div role="alert" className="px-4 py-2.5 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {/* About Content Editor */}
      <form
        onSubmit={handleSaveAbout}
        className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 space-y-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-3">
          Narasi Utama Yayasan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="about-summary-title" className="block text-xs font-medium text-slate-700 mb-1">
              Judul Ringkasan Beranda
            </label>
            <input
              id="about-summary-title"
              type="text"
              required
              value={aboutForm.summaryTitle}
              onChange={(e) => setAboutForm((p) => ({ ...p, summaryTitle: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-900"
            />
          </div>
          <div>
            <label htmlFor="about-vision-title" className="block text-xs font-medium text-slate-700 mb-1">
              Judul Bagian Visi
            </label>
            <input
              id="about-vision-title"
              type="text"
              value={aboutForm.visionTitle}
              onChange={(e) => setAboutForm((p) => ({ ...p, visionTitle: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <label htmlFor="about-summary-body" className="block text-xs font-medium text-slate-700 mb-1">
            Ringkasan Tentang Yayasan (Tampil di Beranda & Tentang Kita)
          </label>
          <textarea
            id="about-summary-body"
            rows={3}
            required
            value={aboutForm.summaryBody}
            onChange={(e) => setAboutForm((p) => ({ ...p, summaryBody: e.target.value }))}
            className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="about-vision-body" className="block text-xs font-medium text-slate-700 mb-1">
            Teks Visi Yayasan
          </label>
          <textarea
            id="about-vision-body"
            rows={2}
            required
            value={aboutForm.visionBody}
            onChange={(e) => setAboutForm((p) => ({ ...p, visionBody: e.target.value }))}
            className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="about-mission-items" className="block text-xs font-medium text-slate-700 mb-1">
            Daftar Misi Yayasan (Satu poin per baris)
          </label>
          <textarea
            id="about-mission-items"
            rows={4}
            value={aboutForm.missionItemsText}
            onChange={(e) => setAboutForm((p) => ({ ...p, missionItemsText: e.target.value }))}
            className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="about-background-body" className="block text-xs font-medium text-slate-700 mb-1">
            Latar Belakang & Sejarah Yayasan
          </label>
          <textarea
            id="about-background-body"
            rows={5}
            required
            value={aboutForm.backgroundBody}
            onChange={(e) => setAboutForm((p) => ({ ...p, backgroundBody: e.target.value }))}
            className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] disabled:opacity-60 rounded-md cursor-pointer"
          >
            {busy ? 'Menyimpan...' : 'Simpan Narasi Tentang Kita'}
          </button>
        </div>
      </form>

      {/* Interactive Contacts Manager */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Kontak Interaktif dengan Tautan Tersemat
            </h3>
            <p className="text-xs text-slate-600">
              Gunakan format <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">[teks tautan](https://... atau mailto:...)</code> untuk menyematkan tautan di dalam kalimat.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingContactId(null);
              setContactForm({ label: '', richText: '' });
              setShowNewContact(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tambah Kontak</span>
          </button>
        </div>

        {(showNewContact || editingContactId !== null) && (
          <form
            onSubmit={handleSaveContact}
            className="bg-white border border-slate-300 rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                {editingContactId !== null ? 'Edit Entri Kontak' : 'Tambah Entri Kontak Baru'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setShowNewContact(false);
                  setEditingContactId(null);
                }}
                aria-label="Tutup formulir kontak"
                className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="contact-label" className="block text-xs font-medium text-slate-700 mb-1">
                Label Kanal Kontak
              </label>
              <input
                id="contact-label"
                type="text"
                required
                value={contactForm.label}
                onChange={(e) => setContactForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Contoh: Relawan & Magang Riset"
                className="w-full h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="contact-richtext" className="block text-xs font-medium text-slate-700 mb-1">
                Teks dengan Tautan Interaktif
              </label>
              <textarea
                id="contact-richtext"
                rows={3}
                required
                value={contactForm.richText}
                onChange={(e) => setContactForm((p) => ({ ...p, richText: e.target.value }))}
                placeholder="Contoh: Kirim lamaran relawan ke [relawan@natabahari.or.id](mailto:relawan@natabahari.or.id) atau lihat [Peta Lokasi](https://maps.google.com)."
                className="w-full p-3 rounded-md border border-slate-300 text-sm text-slate-900 font-mono text-xs"
              />
            </div>

            {contactForm.richText && (
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Pratinjau Tautan Publik
                </p>
                <RichContactText text={contactForm.richText} className="text-sm text-slate-700" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewContact(false);
                  setEditingContactId(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3961] rounded-md cursor-pointer"
              >
                {busy ? 'Menyimpan...' : 'Simpan Kontak'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{contact.label}</p>
                <RichContactText text={contact.richText} className="text-xs text-slate-600 leading-relaxed" />
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewContact(false);
                    setEditingContactId(contact.id);
                    setContactForm({ label: contact.label, richText: contact.richText });
                  }}
                  aria-label={`Edit kontak ${contact.label}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleDeleteContact(contact.id)}
                  aria-label={`Hapus kontak ${contact.label}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
