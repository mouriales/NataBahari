export interface GTranslateLanguageOption {
  code: string;
  shortLabel: string;
  nativeName: string;
  englishName: string;
  dir?: 'ltr' | 'rtl';
}

export const GTRANSLATE_DEFAULT_LANGUAGE = 'id';

export const GTRANSLATE_SCRIPT_URL =
  'https://cdn.gtranslate.net/widgets/latest/lc.js';

export const GTRANSLATE_STORAGE_KEY = '__GT_TRANSLATE_LANGS';

export const GTRANSLATE_LANGUAGES: readonly GTranslateLanguageOption[] = [
  {
    code: 'id',
    shortLabel: 'ID',
    nativeName: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    dir: 'ltr',
  },
  {
    code: 'en',
    shortLabel: 'EN',
    nativeName: 'English',
    englishName: 'English',
    dir: 'ltr',
  },
  {
    code: 'ms',
    shortLabel: 'MS',
    nativeName: 'Bahasa Melayu',
    englishName: 'Malay',
    dir: 'ltr',
  },
  {
    code: 'ja',
    shortLabel: 'JA',
    nativeName: '日本語',
    englishName: 'Japanese',
    dir: 'ltr',
  },
  {
    code: 'zh-CN',
    shortLabel: 'ZH',
    nativeName: '简体中文',
    englishName: 'Chinese (Simplified)',
    dir: 'ltr',
  },
  {
    code: 'nl',
    shortLabel: 'NL',
    nativeName: 'Nederlands',
    englishName: 'Dutch',
    dir: 'ltr',
  },
  {
    code: 'fr',
    shortLabel: 'FR',
    nativeName: 'Français',
    englishName: 'French',
    dir: 'ltr',
  },
  {
    code: 'de',
    shortLabel: 'DE',
    nativeName: 'Deutsch',
    englishName: 'German',
    dir: 'ltr',
  },
  {
    code: 'ar',
    shortLabel: 'AR',
    nativeName: 'العربية',
    englishName: 'Arabic',
    dir: 'rtl',
  },
] as const;

export interface GTranslateSettings {
  default_language: string;
  languages: string[];
  wrapper_selector: string;
  native_language_names: boolean;
  detect_browser_language: boolean;
  url_structure: 'none' | 'sub_directory' | 'sub_domain';
}

export function isSupportedLanguage(code: string): boolean {
  const normalized = code.trim();
  return GTRANSLATE_LANGUAGES.some((lang) => lang.code === normalized);
}

export function getLanguageOption(code: string): GTranslateLanguageOption {
  const found = GTRANSLATE_LANGUAGES.find((lang) => lang.code === code.trim());
  return found ?? GTRANSLATE_LANGUAGES[0];
}

export function buildGTranslatePair(
  targetLang: string,
  sourceLang: string = GTRANSLATE_DEFAULT_LANGUAGE
): string {
  const safeTarget = isSupportedLanguage(targetLang)
    ? targetLang.trim()
    : GTRANSLATE_DEFAULT_LANGUAGE;
  const safeSource = isSupportedLanguage(sourceLang)
    ? sourceLang.trim()
    : GTRANSLATE_DEFAULT_LANGUAGE;
  return `${safeSource}|${safeTarget}`;
}

export function buildGoogTransCookieValue(
  sourceLang: string,
  targetLang: string
): string {
  const safeSource = isSupportedLanguage(sourceLang)
    ? sourceLang.trim()
    : GTRANSLATE_DEFAULT_LANGUAGE;
  const safeTarget = isSupportedLanguage(targetLang)
    ? targetLang.trim()
    : GTRANSLATE_DEFAULT_LANGUAGE;
  return `/${safeSource}/${safeTarget}`;
}

export function parseGoogTransCookie(cookieHeader: string): string | null {
  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return null;
  }
  const match = cookieHeader.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match) return null;
  let decoded = match[1].trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep raw value if malformed URI sequence
  }
  const segments = decoded.split('/').filter(Boolean);
  if (segments.length < 2) return null;
  const target = segments[segments.length - 1];
  return isSupportedLanguage(target) ? target : null;
}

export function parseStoredGTranslateLang(rawJson: string | null): string | null {
  if (!rawJson) return null;
  try {
    const parsed = JSON.parse(rawJson) as { tgtLang?: unknown };
    if (
      parsed &&
      typeof parsed.tgtLang === 'string' &&
      isSupportedLanguage(parsed.tgtLang)
    ) {
      return parsed.tgtLang.trim();
    }
  } catch {
    return null;
  }
  return null;
}

export function buildGTranslateSettings(options?: {
  defaultLanguage?: string;
  wrapperSelector?: string;
  detectBrowserLanguage?: boolean;
}): GTranslateSettings {
  const defaultLanguage =
    options?.defaultLanguage && isSupportedLanguage(options.defaultLanguage)
      ? options.defaultLanguage
      : GTRANSLATE_DEFAULT_LANGUAGE;

  return {
    default_language: defaultLanguage,
    languages: GTRANSLATE_LANGUAGES.map((lang) => lang.code),
    wrapper_selector: options?.wrapperSelector ?? '.gtranslate_wrapper',
    native_language_names: true,
    detect_browser_language: options?.detectBrowserLanguage ?? false,
    url_structure: 'none',
  };
}
