import type { ContactEntry } from '../types/foundation';
import { parseRichContactText } from './richLinks';

export type SocialPlatform =
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'facebook';

export interface SocialLinkItem {
  platform: SocialPlatform;
  platformName: string;
  label: string;
  href: string;
}

const PLATFORM_RULES: Array<{
  platform: SocialPlatform;
  platformName: string;
  hosts: string[];
}> = [
  {
    platform: 'instagram',
    platformName: 'Instagram',
    hosts: ['instagram.com', 'www.instagram.com'],
  },
  {
    platform: 'twitter',
    platformName: 'Twitter',
    hosts: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
  },
  {
    platform: 'linkedin',
    platformName: 'LinkedIn',
    hosts: ['linkedin.com', 'www.linkedin.com', 'id.linkedin.com'],
  },
  {
    platform: 'youtube',
    platformName: 'YouTube',
    hosts: ['youtube.com', 'www.youtube.com', 'youtu.be'],
  },
  {
    platform: 'facebook',
    platformName: 'Facebook',
    hosts: ['facebook.com', 'www.facebook.com', 'fb.com'],
  },
];

export function detectSocialPlatform(
  href: string
): { platform: SocialPlatform; platformName: string } | null {
  let hostname: string;
  try {
    const parsed = new URL(href);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    hostname = parsed.hostname.toLowerCase();
  } catch {
    return null;
  }

  for (const rule of PLATFORM_RULES) {
    if (rule.hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
      return { platform: rule.platform, platformName: rule.platformName };
    }
  }
  return null;
}

/**
 * Extracts deduplicated social media links dynamically from ContactEntry items.
 * Ignores non-social hyperlinks such as mailto:, tel:, or maps.google.com.
 */
export function extractSocialLinks(contacts: ContactEntry[]): SocialLinkItem[] {
  const ordered = [...contacts].sort((a, b) => a.sortOrder - b.sortOrder);
  const seen = new Set<string>();
  const results: SocialLinkItem[] = [];

  for (const entry of ordered) {
    const segments = parseRichContactText(entry.richText);
    for (const seg of segments) {
      if (seg.type !== 'link' || !seg.href) continue;

      const match = detectSocialPlatform(seg.href);
      if (!match) continue;

      const dedupeKey = `${match.platform}|${seg.href.toLowerCase()}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      results.push({
        platform: match.platform,
        platformName: match.platformName,
        label: seg.content.trim() || match.platformName,
        href: seg.href,
      });
    }
  }

  return results;
}
