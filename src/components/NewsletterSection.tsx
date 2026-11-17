import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { submitNewsletterSubscription } from '../utils/api';
import { validateEmail } from '../utils/validation';

export function NewsletterSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const check = validateEmail(email);
    if (!check.valid) {
      setStatus('error');
      setFeedback(check.error || 'Alamat email tidak valid.');
      return;
    }

    setStatus('submitting');
    setFeedback('');

    try {
      const res = await submitNewsletterSubscription({ email, name });
      setStatus('success');
      setFeedback(res.message);
      setEmail('');
      setName('');
    } catch (err) {
      setStatus('error');
      setFeedback(err instanceof Error ? err.message : 'Gagal mendaftarkan email.');
    }
  };

  return (
    <section id="buletin" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="bg-[#18222F] text-white rounded-xl border border-[#273445] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/75">
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>Buletin Bulanan Nata Bahari</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold leading-tight text-white">
            Ikuti Kabar Ekspedisi dan Laporan Konservasi Pesisir
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-lg">
            Dapatkan ringkasan riset lapangan, jadwal aksi bersih pantai, dan panggilan relawan langsung ke kotak masuk Anda setiap bulan.
          </p>
        </div>

        <div className="lg:col-span-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="newsletter-name" className="block text-xs font-medium text-white/80 mb-1.5">
                  Nama (Opsional)
                </label>
                <input
                  id="newsletter-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full h-11 px-3.5 rounded-md bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label htmlFor="newsletter-email" className="block text-xs font-medium text-white/80 mb-1.5">
                  Alamat Email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.id"
                  className="w-full h-11 px-3.5 rounded-md bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-white/65">
                Tanpa spam. Anda dapat berhenti berlangganan kapan saja.
              </p>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-6 py-2.5 text-sm font-semibold text-[#18222F] bg-white rounded-md hover:bg-[#F3F1EA] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {status === 'submitting' ? 'Mendaftarkan...' : 'Berlangganan Buletin'}
              </button>
            </div>

            {status === 'success' && (
              <div
                role="status"
                className="mt-3 p-3 rounded-md bg-[#14532D]/60 border border-emerald-400/30 text-sm text-emerald-100 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{feedback}</span>
              </div>
            )}

            {status === 'error' && (
              <div
                role="alert"
                className="mt-3 p-3 rounded-md bg-red-950/70 border border-red-400/40 text-sm text-red-100"
              >
                {feedback}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
