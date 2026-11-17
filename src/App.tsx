import { useEffect, useState } from 'react';
import { AboutSummarySection } from './components/AboutSummarySection';
import { AboutUsPage } from './components/AboutUsPage';
import { HeroCarousel } from './components/HeroCarousel';
import { NewsletterSection } from './components/NewsletterSection';
import { PortfolioFeedPage } from './components/PortfolioFeedPage';
import { PublicFooter } from './components/PublicFooter';
import { PublicHeader } from './components/PublicHeader';
import { GTranslateWidget } from './components/GTranslateWidget';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import type {
  AboutContent,
  AdminUser,
  BannerSlide,
  ContactEntry,
  PortfolioPost,
  SiteMetadata,
} from './types/foundation';
import { fetchCurrentAdmin, fetchPublicSite } from './utils/api';
import { applyMetadataToDocument } from './utils/seo';

function isAdminRouteOrSubdomain(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    if (host.startsWith('admin.') || params.get('subdomain') === 'admin') {
      return true;
    }
  }
  return false;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [posts, setPosts] = useState<PortfolioPost[]>([]);
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [metadata, setMetadata] = useState<SiteMetadata | null>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  const [siteError, setSiteError] = useState('');

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPublicSite(), fetchCurrentAdmin()])
      .then(([siteData, authData]) => {
        if (!active) return;
        setBanners(siteData.banners);
        setPosts(siteData.posts);
        setAbout(siteData.about);
        setContacts(siteData.contacts);
        setMetadata(siteData.metadata);
        setAdminUser(authData.admin);
      })
      .catch((err) => {
        if (!active) return;
        setSiteError(err instanceof Error ? err.message : 'Gagal memuat data situs.');
      })
      .finally(() => {
        if (!active) return;
        setLoadingSite(false);
        setCheckingAuth(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (metadata) {
      applyMetadataToDocument(metadata);
    }
  }, [metadata]);

  const navigate = (nextPath: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', nextPath);
      setCurrentPath(nextPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNewsletterCta = () => {
    if (currentPath !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById('buletin')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('newsletter-email')?.focus();
      }, 150);
    } else {
      document.getElementById('buletin')?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('newsletter-email')?.focus();
    }
  };

  if (loadingSite || checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center px-4">
        <p className="font-serif text-lg text-[#4B5563]">Memuat Yayasan Nata Bahari...</p>
      </div>
    );
  }

  if (siteError || !about || !metadata) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex items-center justify-center px-4">
        <div className="max-w-md bg-white border border-[#E2DFD5] rounded-lg p-6 text-center space-y-3">
          <h1 className="font-serif text-xl font-semibold text-[#18222F]">
            Kendala Memuat Situs
          </h1>
          <p className="text-sm text-[#57606A]">{siteError || 'Data yayasan belum tersedia.'}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C81] rounded-md cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // Isolated Admin Subdomain / Route Gate
  if (isAdminRouteOrSubdomain(currentPath)) {
    if (!adminUser) {
      return (
        <AdminLoginView
          onSuccess={(user) => setAdminUser(user)}
          onBackToPublic={() => navigate('/')}
        />
      );
    }

    return (
      <AdminDashboard
        admin={adminUser}
        banners={banners}
        posts={posts}
        about={about}
        contacts={contacts}
        metadata={metadata}
        onBannersUpdated={setBanners}
        onPostsUpdated={setPosts}
        onAboutUpdated={setAbout}
        onContactsUpdated={setContacts}
        onMetadataUpdated={setMetadata}
        onSignedOut={() => setAdminUser(null)}
        onNavigatePublic={(path) => navigate(path)}
      />
    );
  }

  // Public Website Shell
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#18222F]">
      <PublicHeader
        currentPath={currentPath}
        onNavigate={navigate}
        onNewsletterClick={handleNewsletterCta}
      />

      <div className="flex-1">
        {currentPath === '/portfolio' ? (
          <PortfolioFeedPage posts={posts} />
        ) : currentPath === '/tentang-kita' ? (
          <AboutUsPage about={about} contacts={contacts} />
        ) : (
          <main>
            <HeroCarousel slides={banners} onNavigate={navigate} />
            <AboutSummarySection
              about={about}
              recentPosts={posts}
              onNavigate={navigate}
            />
            <NewsletterSection />
          </main>
        )}
      </div>

      <PublicFooter contacts={contacts} onNavigate={navigate} />
      <GTranslateWidget />
    </div>
  );
}
