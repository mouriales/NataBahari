import { useMemo, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';
import type { Subscription } from '../../types/foundation';
import { deleteSubscription } from '../../utils/api';

interface AdminSubscribersPanelProps {
  subscriptions: Subscription[];
  loading: boolean;
  onSubscriptionsUpdated: (subscriptions: Subscription[]) => void;
}

export function AdminSubscribersPanel({
  subscriptions,
  loading,
  onSubscriptionsUpdated,
}: AdminSubscribersPanelProps) {
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (s) => s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [subscriptions, query]);

  const handleDelete = async (id: number) => {
    setBusyId(id);
    try {
      const res = await deleteSubscription(id);
      onSubscriptionsUpdated(res.subscriptions);
    } finally {
      setBusyId(null);
    }
  };

  const handleExportCsv = () => {
    const header = 'ID,Email,Nama,Tanggal Daftar\n';
    const rows = filtered
      .map((s) => `${s.id},"${s.email.replace(/"/g, '""')}","${s.name.replace(/"/g, '""')}","${s.createdAt}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pelanggan-buletin-nata-bahari.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Daftar Pelanggan Buletin ({subscriptions.length})
          </h2>
          <p className="text-sm text-slate-600">
            Pengunjung yang mendaftarkan alamat email untuk menerima kabar terbaru Yayasan Nata Bahari.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Unduh CSV</span>
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Cari pelanggan buletin"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari email atau nama..."
          className="w-full h-9 pl-9 pr-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900"
        />
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-500">
          Memuat daftar pelanggan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2">
          <p className="text-sm font-medium text-slate-900">Tidak ada pelanggan ditemukan</p>
          <p className="text-xs text-slate-500">
            Alamat email yang didaftarkan melalui formulir buletin di halaman utama akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="subscribers-table">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Nama</th>
                  <th className="py-2.5 px-4">Terdaftar</th>
                  <th className="py-2.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-mono tabular-nums text-xs text-slate-500">
                      #{sub.id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">{sub.email}</td>
                    <td className="py-2.5 px-4 text-slate-600">{sub.name || '—'}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-xs text-slate-500">
                      {sub.createdAt}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={busyId === sub.id}
                        onClick={() => handleDelete(sub.id)}
                        aria-label={`Hapus pelanggan ${sub.email}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
