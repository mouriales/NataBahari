export type AdminRole = 'super_admin' | 'editor';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
}

export interface BannerSlide {
  id: number;
  sortOrder: number;
  kicker: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  updatedAt: string;
}

export interface PortfolioPost {
  id: number;
  title: string;
  category: string;
  location: string;
  activityDate: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AboutContent {
  id: number;
  summaryTitle: string;
  summaryBody: string;
  visionTitle: string;
  visionBody: string;
  missionTitle: string;
  missionItems: string[];
  backgroundTitle: string;
  backgroundBody: string;
  updatedAt: string;
}

export interface ContactEntry {
  id: number;
  label: string;
  richText: string;
  sortOrder: number;
}

export interface Subscription {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export type OgType = 'website' | 'article' | 'profile';

export interface SiteMetadata {
  id: number;
  siteTitle: string;
  siteDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: OgType;
  ogSiteName: string;
  updatedAt: string;
}

export interface PublicSitePayload {
  banners: BannerSlide[];
  posts: PortfolioPost[];
  about: AboutContent;
  contacts: ContactEntry[];
  metadata: SiteMetadata;
}
