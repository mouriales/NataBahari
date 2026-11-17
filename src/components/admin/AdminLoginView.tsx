import { useState, type FormEvent } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import type { AdminUser } from '../../types/foundation';
import { loginAdmin } from '../../utils/api';

interface AdminLoginViewProps {
  onSuccess: (admin: AdminUser) => void;
  onBackToPublic: () => void;
}

export function AdminLoginView({ onSuccess, onBackToPublic }: AdminLoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAdmin({ email, password });
      onSuccess(res.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke portal admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center px-4 py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToPublic();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Situs Publik</span>
          </a>
          <span className="font-mono text-xs text-slate-400">admin.natabahari.or.id</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-7 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/30 border border-[#0F4C81]/60 flex items-center justify-center text-sky-300">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-white">
              Portal Administrator
            </h1>
            <p className="text-sm text-slate-400">
              Masuk untuk mengelola banner beranda, portofolio kegiatan, profil yayasan, dan daftar pelanggan buletin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Administrator
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@natabahari.or.id"
                className="w-full h-11 px-3.5 rounded-md bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full h-11 px-3.5 rounded-md bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-md bg-red-950/70 border border-red-700/60 text-xs text-red-200"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 text-sm font-semibold text-white bg-[#0F4C81] hover:bg-[#155D9C] disabled:opacity-60 rounded-md transition-colors cursor-pointer"
            >
              {loading ? 'Memverifikasi...' : 'Masuk ke Dasbor'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">
              Kredensial bawaan pengelola: <code className="font-mono text-slate-200">admin@natabahari.or.id</code> /{' '}
              <code className="font-mono text-slate-200">NataBahari2026!</code>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@natabahari.or.id');
                setPassword('NataBahari2026!');
              }}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
            >
              Isi Kredensial Pengurus Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
