import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import type { ContactEntry } from '../types/foundation';
import { extractSocialLinks, type SocialPlatform } from '../utils/socialLinks';

interface FooterSocialLinksProps {
  contacts: ContactEntry[];
}

function SocialPlatformIcon({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case 'instagram':
      return <Instagram className="w-4 h-4" aria-hidden="true" />;
    case 'twitter':
      return <Twitter className="w-4 h-4" aria-hidden="true" />;
    case 'linkedin':
      return <Linkedin className="w-4 h-4" aria-hidden="true" />;
    case 'youtube':
      return <Youtube className="w-4 h-4" aria-hidden="true" />;
    case 'facebook':
      return <Facebook className="w-4 h-4" aria-hidden="true" />;
  }
}

export function FooterSocialLinks({ contacts }: FooterSocialLinksProps) {
  const socialLinks = extractSocialLinks(contacts);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div
      className="pt-2 flex items-center gap-2.5 flex-wrap"
      aria-label="Media sosial Yayasan Nata Bahari"
      data-testid="footer-social-links"
    >
      {socialLinks.map((item) => (
        <a
          key={`${item.platform}-${item.href}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`${item.platformName}: ${item.label}`}
          aria-label={`${item.platformName} (${item.label})`}
          className="w-10 h-10 rounded-md border border-[#D8D3C6] bg-[#F8F7F3] text-[#18222F] hover:border-[#0F4C81] hover:text-[#0F4C81] hover:bg-white transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
        >
          <SocialPlatformIcon platform={item.platform} />
        </a>
      ))}
    </div>
  );
}
