import type { ContactEntry } from '../types/foundation';
import { FooterSocialLinks } from './FooterSocialLinks';

interface PublicFooterProps {
  contacts: ContactEntry[];
  onNavigate: (path: string) => void;
}

export function PublicFooter({ contacts, onNavigate }: PublicFooterProps) {
  return (
    <footer className="border-t border-[#E2DFD5] bg-[#EFECE4]/60 text-[#4B5563]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 space-y-3">
          <p className="font-serif text-lg font-semibold text-[#18222F]">
            Yayasan Nata Bahari
          </p>
          <p className="text-sm leading-relaxed max-w-md">
            Lembaga nirlaba konservasi ekosistem pesisir, restorasi terumbu karang, dan pendidikan literasi maritim di Indonesia.
          </p>
          <FooterSocialLinks contacts={contacts} />
        </div>

        <div className="md:col-span-3 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#18222F]">
            Navigasi
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/');
                }}
                className="hover:text-[#0F4C81] transition-colors"
              >
                Beranda
              </a>
            </li>
            <li>
              <a
                href="/portfolio"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/portfolio');
                }}
                className="hover:text-[#0F4C81] transition-colors"
              >
                Portofolio Aktivitas
              </a>
            </li>
            <li>
              <a
                href="/tentang-kita"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/tentang-kita');
                }}
                className="hover:text-[#0F4C81] transition-colors"
              >
                Tentang Kita
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#18222F]">
            Sekretariat & Pengelolaan
          </p>
          <p className="text-sm leading-relaxed">
            Dusun IV Kalangan, Pulau Pahawang, Pardasuka, Kabupaten Pesawaran, Lampung 35453
          </p>
          <p className="text-sm">
            <a
              href="mailto:sekretariat@natabahari.or.id"
              className="text-[#0F4C81] hover:underline"
            >
              sekretariat@natabahari.or.id
            </a>
          </p>
          <div className="pt-2">
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin');
              }}
              className="text-xs font-medium text-[#57606A] underline underline-offset-4 hover:text-[#18222F] transition-colors"
            >
              Portal Admin
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7280]">
          <span>© 2026 Yayasan Nata Bahari. Seluruh hak cipta dilindungi.</span>
          <span>Terdaftar sebagai Lembaga Konservasi Pesisir Independen</span>
        </div>
      </div>
    </footer>
  );
}
