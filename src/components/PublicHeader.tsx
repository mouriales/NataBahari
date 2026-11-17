import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type PublicRoute = '/' | '/portfolio' | '/tentang-kita';

interface PublicHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onNewsletterClick: () => void;
}

export function PublicHeader({
  currentPath,
  onNavigate,
  onNewsletterClick,
}: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ label: string; path: PublicRoute }> = [
    { label: 'Beranda', path: '/' },
    { label: 'Portofolio', path: '/portfolio' },
    { label: 'Tentang Kita', path: '/tentang-kita' },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-sm border-b border-[#E2DFD5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Logo + Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="inline-flex items-center gap-2.5 sm:gap-3 font-serif text-base sm:text-xl font-semibold tracking-tight text-[#18222F] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F4C81]"
        >
          <span className="h-8 w-20 sm:h-10 sm:w-24 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/Untitled-1_bfab193a.png"
              alt="Logo Yayasan Nata Bahari"
              className="w-full h-full object-cover object-center"
            />
          </span>
          <span>Yayasan Nata Bahari</span>
        </a>

        {/* Zone 2: Clean single-line nav links */}
        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                aria-current={active ? 'page' : undefined}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F4C81] ${
                  active
                    ? 'text-[#0F4C81] border-[#0F4C81]'
                    : 'text-[#4B5563] border-transparent hover:text-[#18222F] hover:border-[#D1CDC0]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onNewsletterClick();
            }}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] rounded-md hover:bg-[#0B3961] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
          >
            Buletin Kami
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-[#18222F] hover:bg-[#EFECE4] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Navigasi seluler"
          className="md:hidden border-t border-[#E2DFD5] bg-[#F8F7F3] px-4 py-3 flex flex-col gap-1"
        >
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
                aria-current={active ? 'page' : undefined}
                className={`px-3 py-2.5 rounded-md text-sm font-medium ${
                  active ? 'bg-[#EFECE4] text-[#0F4C81]' : 'text-[#18222F] hover:bg-[#EFECE4]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onNewsletterClick();
            }}
            className="mt-2 w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#0F4C81] rounded-md hover:bg-[#0B3961] cursor-pointer"
          >
            Berlangganan Buletin
          </button>
        </nav>
      )}
    </header>
  );
}
