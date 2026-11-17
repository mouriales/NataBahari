export interface RichTextSegment {
  type: 'text' | 'link';
  content: string;
  href?: string;
  isExternal?: boolean;
}

const ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];

export function sanitizeHref(rawHref: string): string | null {
  const trimmed = rawHref.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol.toLowerCase())) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

export function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

/**
 * Parses prose containing inline markdown-style hyperlinks `[anchor phrase](url)`
 * into safe renderable text and link segments.
 */
export function parseRichContactText(input: string): RichTextSegment[] {
  if (!input) return [];

  const segments: RichTextSegment[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: input.slice(lastIndex, match.index),
      });
    }

    const label = match[1];
    const rawHref = match[2];
    const safeHref = sanitizeHref(rawHref);

    if (safeHref) {
      segments.push({
        type: 'link',
        content: label,
        href: safeHref,
        isExternal: isExternalHref(safeHref),
      });
    } else {
      segments.push({
        type: 'text',
        content: label,
      });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
  }

  return segments;
}
