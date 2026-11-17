import type { SiteMetadata } from '../types/foundation.ts';

export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function upsertMetaTag(
  html: string,
  attrKey: 'name' | 'property',
  attrVal: string,
  content: string
): string {
  const escapedContent = escapeHtmlAttr(content);
  const regex = new RegExp(
    `<meta\\s+[^>]*${attrKey}=["']${attrVal.replace(':', '\\:')}["'][^>]*>`,
    'i'
  );
  const replacement = `<meta ${attrKey}="${attrVal}" content="${escapedContent}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

/**
 * Pure server-side HTML metadata injector that updates title, description,
 * OpenGraph, and Twitter tags safely.
 */
export function injectHtmlMetadata(html: string, metadata: SiteMetadata): string {
  let next = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtmlText(metadata.siteTitle)}</title>`
  );

  next = upsertMetaTag(next, 'name', 'description', metadata.siteDescription);
  next = upsertMetaTag(next, 'property', 'og:title', metadata.ogTitle);
  next = upsertMetaTag(next, 'property', 'og:description', metadata.ogDescription);
  next = upsertMetaTag(next, 'property', 'og:type', metadata.ogType);
  next = upsertMetaTag(next, 'property', 'og:site_name', metadata.ogSiteName);
  next = upsertMetaTag(next, 'property', 'og:image', metadata.ogImage);
  next = upsertMetaTag(next, 'name', 'twitter:title', metadata.ogTitle);
  next = upsertMetaTag(next, 'name', 'twitter:description', metadata.ogDescription);
  next = upsertMetaTag(next, 'name', 'twitter:image', metadata.ogImage);

  return next;
}

function setDomMeta(attrKey: 'name' | 'property', attrVal: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attrKey}="${attrVal}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Synchronizes runtime browser document.head metadata tags when metadata config updates.
 */
export function applyMetadataToDocument(metadata: SiteMetadata): void {
  if (typeof document === 'undefined') return;
  document.title = metadata.siteTitle;
  setDomMeta('name', 'description', metadata.siteDescription);
  setDomMeta('property', 'og:title', metadata.ogTitle);
  setDomMeta('property', 'og:description', metadata.ogDescription);
  setDomMeta('property', 'og:type', metadata.ogType);
  setDomMeta('property', 'og:site_name', metadata.ogSiteName);
  setDomMeta('property', 'og:image', metadata.ogImage);
  setDomMeta('name', 'twitter:title', metadata.ogTitle);
  setDomMeta('name', 'twitter:description', metadata.ogDescription);
  setDomMeta('name', 'twitter:image', metadata.ogImage);
}
