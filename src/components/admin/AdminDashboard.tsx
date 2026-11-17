import { useEffect, useState } from 'react';
import {
  ExternalLink,
  FileText,
  Globe,
  Images,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import type {
  AboutContent,
  AdminUser,
  BannerSlide,
  ContactEntry,
  PortfolioPost,
  SiteMetadata,
  Subscription,
} from '../../types/foundation';
import { fetchAdminSubscriptions, logoutAdmin } from '../../utils/api';
import { AdminAboutContactsPanel } from './AdminAboutContactsPanel';
import { AdminBannersPanel } from './AdminBannersPanel';
import { AdminMetadataPanel } from './AdminMetadataPanel';
import { AdminPortfolioPanel } from './AdminPortfolioPanel';
import { AdminSubscribersPanel } from './AdminSubscribersPanel';

type AdminTab = 'banners' | 'portfolio' | 'about' | 'subscribers' | 'metadata';

interface AdminDashboardProps {
  admin: AdminUser;
  banners: BannerSlide[];
  posts: PortfolioPost[];
  about: AboutContent;
  contacts: ContactEntry[];
  metadata: SiteMetadata;
  onBannersUpdated: (banners: BannerSlide[]) => void;
  onPostsUpdated: (posts: PortfolioPost[]) => void;
  onAboutUpdated: (about: AboutContent) => void;
  onContactsUpdated: (contacts: ContactEntry[]) => void;
  onMetadataUpdated: (metadata: SiteMetadata) => void;
  onSignedOut: () => void;
  onNavigatePublic: (path: string) => void;
}

export function AdminDashboard({
  admin,
  banners,
  posts,
  about,
  contacts,
  metadata,
  onBannersUpdated,
  onPostsUpdated,
  onAboutUpdated,
  onContactsUpdated,
  onMetadataUpdated,
  onSignedOut,
  onNavigatePublic,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('banners');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    setLoadingSubs(true);
    fetchAdminSubscriptions()
      .then((res) => setSubscriptions(res.subscriptions))
      .catch(() => undefined)
      .finally(() => setLoadingSubs(false));
  }, []);

  const handleLogout = async () => {
    await logoutAdmin().catch(() => undefined);
    onSignedOut();
  };

  const navItems: Array<{ id: AdminTab; label: string; count?: number; icon: typeof Images }> = [
    { id: 'banners', label: 'Banner Beranda', count: banners.length, icon: Images },
    { id: 'portfolio', label: 'Portofolio Aktivitas', count: posts.length, icon: LayoutGrid },
    { id: 'about', label: 'Tentang Kita & Kontak', icon: FileText },
    { id: 'metadata', label: 'Metadata & SEO', icon: Globe },
    { id: 'subscribers', label: 'Pelanggan Buletin', count: subscriptions.length, icon: Mail },
  ];

  const activeLabel = navItems.find((i) => i.id === activeTab)?.label || 'Dasbor';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0">
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-serif text-base font-semibold text-white whitespace-nowrap">
            Nata Bahari Admin
          </span>
        </div>

        <nav aria-label="Menu Administrator" className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#0F4C81] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span className="font-mono tabular-nums text-[11px] opacity-80">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="text-xs">
            <p className="font-medium text-white truncate">{admin.name}</p>
            <p className="text-slate-400 truncate">{admin.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] bg-slate-900 text-slate-200 flex flex-col z-10">
            <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-serif text-base font-semibold text-white">
                Nata Bahari Admin
              </span>
              <button
                type="button"
                aria-label="Tutup menu admin"
                onClick={() => setSidebarOpen(false)}
                className="w-9 h-9 rounded flex items-center justify-center text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md text-xs font-medium ${
                      active ? 'bg-[#0F4C81] text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Buka menu admin"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-xs text-slate-500 flex items-center gap-2 truncate">
              <span className="font-mono">admin.natabahari.or.id</span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 truncate">{activeLabel}</span>
            </div>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePublic('/');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0"
          >
            <span>Lihat Situs Publik</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto">
          {activeTab === 'banners' && (
            <AdminBannersPanel banners={banners} onBannersUpdated={onBannersUpdated} />
          )}

          {activeTab === 'portfolio' && (
            <AdminPortfolioPanel posts={posts} onPostsUpdated={onPostsUpdated} />
          )}

          {activeTab === 'about' && (
            <AdminAboutContactsPanel
              about={about}
              contacts={contacts}
              onAboutUpdated={onAboutUpdated}
              onContactsUpdated={onContactsUpdated}
            />
          )}

          {activeTab === 'metadata' && (
            <AdminMetadataPanel
              metadata={metadata}
              onMetadataUpdated={onMetadataUpdated}
            />
          )}

          {activeTab === 'subscribers' && (
            <AdminSubscribersPanel
              subscriptions={subscriptions}
              loading={loadingSubs}
              onSubscriptionsUpdated={setSubscriptions}
            />
          )}
        </main>
      </div>
    </div>
  );
}
