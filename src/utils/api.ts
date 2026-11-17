import type {
  AboutContent,
  AdminUser,
  BannerSlide,
  ContactEntry,
  OgType,
  PortfolioPost,
  PublicSitePayload,
  SiteMetadata,
  Subscription,
} from '../types/foundation';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Permintaan gagal (${res.status}).`);
  }
  return data as T;
}

export function fetchPublicSite(): Promise<PublicSitePayload> {
  return requestJson<PublicSitePayload>('/api/public/site');
}

export function submitNewsletterSubscription(payload: {
  email: string;
  name: string;
}): Promise<{ id: number; email: string; name: string; message: string }> {
  return requestJson('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentAdmin(): Promise<{ admin: AdminUser | null }> {
  return fetch('/api/auth/me', { credentials: 'include' }).then(async (res) => {
    if (!res.ok) return { admin: null };
    return res.json();
  });
}

export function loginAdmin(payload: {
  email: string;
  password: string;
}): Promise<{ admin: AdminUser }> {
  return requestJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logoutAdmin(): Promise<{ ok: boolean }> {
  return requestJson('/api/auth/logout', { method: 'POST' });
}

export function uploadAdminImage(dataUrl: string): Promise<{ url: string }> {
  return requestJson('/api/admin/upload', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });
}

export function updateBannerSlide(
  id: number,
  payload: {
    kicker: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
  }
): Promise<{ banners: BannerSlide[] }> {
  return requestJson(`/api/admin/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function reorderBannerSlides(orderedIds: number[]): Promise<{ banners: BannerSlide[] }> {
  return requestJson('/api/admin/banners/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  });
}

export function createPortfolioPost(payload: {
  title: string;
  category: string;
  location: string;
  activityDate: string;
  imageUrl: string;
  description: string;
}): Promise<{ posts: PortfolioPost[] }> {
  return requestJson('/api/admin/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePortfolioPost(
  id: number,
  payload: {
    title: string;
    category: string;
    location: string;
    activityDate: string;
    imageUrl: string;
    description: string;
  }
): Promise<{ posts: PortfolioPost[] }> {
  return requestJson(`/api/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deletePortfolioPost(id: number): Promise<{ posts: PortfolioPost[] }> {
  return requestJson(`/api/admin/posts/${id}`, {
    method: 'DELETE',
  });
}

export function updateAboutContent(payload: {
  summaryTitle: string;
  summaryBody: string;
  visionTitle: string;
  visionBody: string;
  missionTitle: string;
  missionItems: string[];
  backgroundTitle: string;
  backgroundBody: string;
}): Promise<{ about: AboutContent }> {
  return requestJson('/api/admin/about', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createContactEntry(payload: {
  label: string;
  richText: string;
}): Promise<{ contacts: ContactEntry[] }> {
  return requestJson('/api/admin/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateContactEntry(
  id: number,
  payload: { label: string; richText: string }
): Promise<{ contacts: ContactEntry[] }> {
  return requestJson(`/api/admin/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteContactEntry(id: number): Promise<{ contacts: ContactEntry[] }> {
  return requestJson(`/api/admin/contacts/${id}`, {
    method: 'DELETE',
  });
}

export function fetchAdminSubscriptions(): Promise<{ subscriptions: Subscription[] }> {
  return requestJson('/api/admin/subscriptions');
}

export function deleteSubscription(id: number): Promise<{ subscriptions: Subscription[] }> {
  return requestJson(`/api/admin/subscriptions/${id}`, {
    method: 'DELETE',
  });
}

export function updateSiteMetadata(payload: {
  siteTitle: string;
  siteDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: OgType;
  ogSiteName: string;
}): Promise<{ metadata: SiteMetadata }> {
  return requestJson('/api/admin/metadata', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
