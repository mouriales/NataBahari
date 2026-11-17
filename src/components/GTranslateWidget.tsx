import { useEffect, useRef, useState } from 'react';
import { Check, ChevronUp, Globe } from 'lucide-react';
import {
  GTRANSLATE_DEFAULT_LANGUAGE,
  GTRANSLATE_LANGUAGES,
  GTRANSLATE_SCRIPT_URL,
  GTRANSLATE_STORAGE_KEY,
  buildGTranslatePair,
  buildGTranslateSettings,
  buildGoogTransCookieValue,
  getLanguageOption,
  parseGoogTransCookie,
  parseStoredGTranslateLang,
} from '../utils/gtranslate';

declare global {
  interface Window {
    gtranslateSettings?: ReturnType<typeof buildGTranslateSettings>;
    doGTranslate?: (langPair: string) => void;
  }
}

const SCRIPT_ELEMENT_ID = 'gtranslate-lc-script';

function resolveInitialLanguage(): string {
  if (typeof window === 'undefined') {
    return GTRANSLATE_DEFAULT_LANGUAGE;
  }
  const fromStorage = parseStoredGTranslateLang(
    window.localStorage.getItem(GTRANSLATE_STORAGE_KEY)
  );
  if (fromStorage) return fromStorage;

  const fromCookie = parseGoogTransCookie(document.cookie);
  if (fromCookie) return fromCookie;

  return GTRANSLATE_DEFAULT_LANGUAGE;
}

export function GTranslateWidget() {
  const [activeLang, setActiveLang] = useState<string>(resolveInitialLanguage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingPairRef = useRef<string | null>(null);

  useEffect(() => {
    window.gtranslateSettings = buildGTranslateSettings({
      defaultLanguage: GTRANSLATE_DEFAULT_LANGUAGE,
      wrapperSelector: '.gtranslate_wrapper',
      detectBrowserLanguage: false,
    });

    const option = getLanguageOption(activeLang);
    document.documentElement.lang = option.code;

    const existingScript = document.getElementById(
      SCRIPT_ELEMENT_ID
    ) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = SCRIPT_ELEMENT_ID;
      script.src = GTRANSLATE_SCRIPT_URL;
      script.defer = true;
      script.addEventListener('load', () => {
        setScriptFailed(false);
        if (pendingPairRef.current && typeof window.doGTranslate === 'function') {
          window.doGTranslate(pendingPairRef.current);
          pendingPairRef.current = null;
        }
      });
      script.addEventListener('error', () => {
        setScriptFailed(true);
        setTranslating(false);
      });
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleSelectLanguage = (targetLang: string) => {
    const option = getLanguageOption(targetLang);
    setActiveLang(option.code);
    setMenuOpen(false);

    document.documentElement.lang = option.code;

    const cookieVal = buildGoogTransCookieValue(
      GTRANSLATE_DEFAULT_LANGUAGE,
      option.code
    );
    document.cookie = `googtrans=${cookieVal}; path=/; SameSite=Lax`;

    try {
      window.localStorage.setItem(
        GTRANSLATE_STORAGE_KEY,
        JSON.stringify({
          srcLang: GTRANSLATE_DEFAULT_LANGUAGE,
          tgtLang: option.code,
        })
      );
    } catch {
      // Ignore storage quota errors
    }

    const pair = buildGTranslatePair(option.code, GTRANSLATE_DEFAULT_LANGUAGE);
    if (typeof window.doGTranslate === 'function') {
      setTranslating(true);
      try {
        window.doGTranslate(pair);
      } finally {
        window.setTimeout(() => setTranslating(false), 600);
      }
    } else if (!scriptFailed) {
      pendingPairRef.current = pair;
    }
  };

  const currentOption = getLanguageOption(activeLang);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-30 notranslate"
      data-testid="gtranslate-widget"
      data-active-lang={currentOption.code}
    >
      {/* Hidden mount node required by GTranslate lc.js */}
      <div className="gtranslate_wrapper hidden" aria-hidden="true" />

      {menuOpen && (
        <div
          role="listbox"
          aria-label="Pilih bahasa situs"
          className="mb-2 w-60 rounded-lg border border-[#E2DFD5] bg-[#FFFFFF] shadow-lg py-1.5 overflow-hidden"
        >
          <div className="px-3 py-1.5 border-b border-[#EFECE4] flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#57606A]">
              Terjemahan Situs
            </span>
            <span className="text-[11px] font-mono text-[#6B7280]">
              GTranslate
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {GTRANSLATE_LANGUAGES.map((lang) => {
              const selected = lang.code === currentOption.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#0F4C81]/8 text-[#0F4C81] font-semibold'
                      : 'text-[#18222F] hover:bg-[#F8F7F3]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex items-center justify-center w-7 h-5 rounded border border-[#E2DFD5] bg-[#F8F7F3] font-mono text-[11px] font-semibold text-[#18222F] shrink-0">
                      {lang.shortLabel}
                    </span>
                    <span className="truncate">{lang.nativeName}</span>
                  </span>
                  {selected && (
                    <Check className="w-4 h-4 text-[#0F4C81] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        aria-label={`Ubah bahasa situs (saat ini: ${currentOption.nativeName})`}
        className="h-10 px-3.5 inline-flex items-center gap-2 rounded-md border border-[#D1CDC0] bg-[#FFFFFF]/95 backdrop-blur-sm text-[#18222F] shadow-md hover:border-[#0F4C81] hover:text-[#0F4C81] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4C81]"
      >
        <Globe className="w-4 h-4 text-[#0F4C81] shrink-0" />
        <span className="font-mono text-xs font-semibold tracking-wide">
          {currentOption.shortLabel}
        </span>
        <span className="hidden sm:inline text-xs font-medium">
          {translating ? 'Menerjemahkan...' : currentOption.nativeName}
        </span>
        <ChevronUp
          className={`w-3.5 h-3.5 text-[#57606A] transition-transform ${
            menuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
}
