import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRichContactText, sanitizeHref } from './richLinks';
import {
  moveBannerSlide,
  getNextSlideIndex,
  getPrevSlideIndex,
  HERO_SLIDE_COUNT,
} from './bannerOrder';
import {
  validateEmail,
  validateBannerInput,
  validatePortfolioPostInput,
} from './validation';
import type { BannerSlide } from '../types/foundation';

function makeSlide(id: number, sortOrder: number): BannerSlide {
  return {
    id,
    sortOrder,
    kicker: `Program ${id}`,
    title: `Slide ${id}`,
    subtitle: 'Deskripsi singkat konservasi laut.',
    imageUrl: `/src/assets/images/slide_${id}.jpg`,
    ctaLabel: 'Lihat Program',
    ctaHref: '/portfolio',
    updatedAt: '2026-11-16T00:00:00Z',
  };
}

test('parseRichContactText extracts safe inline hyperlinks and preserves surrounding prose', () => {
  const segments = parseRichContactText(
    'Hubungi sekretariat melalui [sekretariat@natabahari.or.id](mailto:sekretariat@natabahari.or.id) atau ikuti [@natabahari.id](https://instagram.com/natabahari.id).'
  );

  assert.equal(segments.length, 5);
  assert.deepEqual(segments[0], { type: 'text', content: 'Hubungi sekretariat melalui ' });
  assert.deepEqual(segments[1], {
    type: 'link',
    content: 'sekretariat@natabahari.or.id',
    href: 'mailto:sekretariat@natabahari.or.id',
    isExternal: false,
  });
  assert.deepEqual(segments[3], {
    type: 'link',
    content: '@natabahari.id',
    href: 'https://instagram.com/natabahari.id',
    isExternal: true,
  });
});

test('sanitizeHref rejects dangerous protocols such as javascript:', () => {
  assert.equal(sanitizeHref('javascript:alert(1)'), null);
  assert.equal(sanitizeHref('data:text/html,<h1>x</h1>'), null);
  assert.equal(sanitizeHref('mailto:halo@natabahari.or.id'), 'mailto:halo@natabahari.or.id');
  assert.equal(sanitizeHref('https://maps.google.com/?q=Jakarta'), 'https://maps.google.com/?q=Jakarta');

  const segments = parseRichContactText('Klik [tautan bahaya](javascript:alert(1)) ini.');
  assert.equal(segments[1].type, 'text');
  assert.equal(segments[1].content, 'tautan bahaya');
});

test('moveBannerSlide reorders 8 carousel slides deterministically', () => {
  const slides = Array.from({ length: HERO_SLIDE_COUNT }, (_, idx) =>
    makeSlide(idx + 1, idx + 1)
  );

  const movedUp = moveBannerSlide(slides, 3, 'up');
  assert.deepEqual(
    movedUp.map((s) => s.id),
    [1, 3, 2, 4, 5, 6, 7, 8]
  );
  assert.deepEqual(
    movedUp.map((s) => s.sortOrder),
    [1, 2, 3, 4, 5, 6, 7, 8]
  );

  const movedDown = moveBannerSlide(movedUp, 1, 'down');
  assert.deepEqual(
    movedDown.map((s) => s.id),
    [3, 1, 2, 4, 5, 6, 7, 8]
  );

  // Moving first slide up does not mutate order
  const boundary = moveBannerSlide(movedDown, 3, 'up');
  assert.deepEqual(
    boundary.map((s) => s.id),
    [3, 1, 2, 4, 5, 6, 7, 8]
  );
});

test('carousel index wrap-around works across 8 slides', () => {
  assert.equal(getNextSlideIndex(7, 8), 0);
  assert.equal(getPrevSlideIndex(0, 8), 7);
  assert.equal(getNextSlideIndex(2, 8), 3);
});

test('validation helpers enforce required fields and email format', () => {
  assert.equal(validateEmail('budi@pesisir.id').valid, true);
  assert.equal(validateEmail('invalid-email').valid, false);
  assert.equal(validateEmail('').valid, false);

  assert.equal(
    validateBannerInput({
      title: 'Restorasi Terumbu Karang',
      subtitle: 'Menumbuhkan kembali rumah biota laut di Nusa Tenggara.',
      imageUrl: '/src/assets/images/hero_coral_reef_1794819970201.jpg',
    }).valid,
    true
  );
  assert.equal(
    validateBannerInput({ title: 'ab', subtitle: 'short', imageUrl: '' }).valid,
    false
  );

  assert.equal(
    validatePortfolioPostInput({
      title: 'Penanaman 1.200 Bibit Mangrove',
      category: 'Restorasi Pesisir',
      description: 'Kegiatan bersama nelayan lokal di muara Teluk Banten untuk menahan abrasi.',
      imageUrl: '/uploads/mangrove.jpg',
    }).valid,
    true
  );
});

import { extractSocialLinks, detectSocialPlatform } from './socialLinks';
import type { ContactEntry } from '../types/foundation';

test('detectSocialPlatform classifies Instagram, Twitter/X, LinkedIn, YouTube, and Facebook accurately', () => {
  assert.deepEqual(detectSocialPlatform('https://instagram.com/natabahari.id'), {
    platform: 'instagram',
    platformName: 'Instagram',
  });
  assert.deepEqual(detectSocialPlatform('https://x.com/natabahari'), {
    platform: 'twitter',
    platformName: 'Twitter',
  });
  assert.deepEqual(detectSocialPlatform('https://www.linkedin.com/company/yayasan-nata-bahari'), {
    platform: 'linkedin',
    platformName: 'LinkedIn',
  });
  assert.equal(detectSocialPlatform('https://maps.google.com/?q=Jakarta'), null);
  assert.equal(detectSocialPlatform('mailto:sekretariat@natabahari.or.id'), null);
});

test('extractSocialLinks dynamically extracts and deduplicates social links from contacts state', () => {
  const contacts: ContactEntry[] = [
    {
      id: 1,
      label: 'Email & Peta',
      richText:
        'Hubungi [sekretariat@natabahari.or.id](mailto:sekretariat@natabahari.or.id) atau lihat [Peta Lokasi](https://maps.google.com/?q=Jakarta).',
      sortOrder: 1,
    },
    {
      id: 2,
      label: 'Media Sosial',
      richText:
        'Ikuti [IG Nata Bahari](https://instagram.com/natabahari.id), [X @natabahari](https://twitter.com/natabahari), dan [LinkedIn Nata Bahari](https://linkedin.com/company/yayasan-nata-bahari).',
      sortOrder: 2,
    },
    {
      id: 3,
      label: 'Duplikat Instagram',
      richText: 'Lihat juga [Instagram](https://instagram.com/natabahari.id).',
      sortOrder: 3,
    },
  ];

  const extracted = extractSocialLinks(contacts);
  assert.equal(extracted.length, 3);
  assert.deepEqual(
    extracted.map((item) => item.platform),
    ['instagram', 'twitter', 'linkedin']
  );
  assert.equal(extracted[1].href, 'https://twitter.com/natabahari');
  assert.equal(extracted[2].label, 'LinkedIn Nata Bahari');
});

import { injectHtmlMetadata } from './seo';
import { validateMetadataInput } from './validation';

test('validateMetadataInput enforces title, description, and OpenGraph bounds', () => {
  assert.equal(
    validateMetadataInput({
      siteTitle: 'Yayasan Nata Bahari — Konservasi Laut',
      siteDescription: 'Organisasi konservasi pesisir, terumbu karang, dan literasi maritim Indonesia.',
      ogTitle: 'Yayasan Nata Bahari',
      ogDescription: 'Program konservasi ekosistem pesisir dan pemberdayaan masyarakat laut.',
      ogSiteName: 'Yayasan Nata Bahari',
    }).valid,
    true
  );

  assert.equal(
    validateMetadataInput({
      siteTitle: 'Abc',
      siteDescription: 'Terlalu pendek',
      ogTitle: 'Yayasan',
      ogDescription: 'Deskripsi singkat',
      ogSiteName: '',
    }).valid,
    false
  );
});

test('injectHtmlMetadata updates title, description, OpenGraph, and escapes quotes safely', () => {
  const sampleHtml = `<!doctype html><html><head><title>Old</title><meta name="description" content="Old desc" /><meta property="og:title" content="Old OG" /><meta property="og:description" content="Old OG desc" /><meta property="og:type" content="website" /></head><body></body></html>`;
  const updated = injectHtmlMetadata(sampleHtml, {
    id: 1,
    siteTitle: 'Nata Bahari "Lestari" <2026>',
    siteDescription: 'Konservasi terumbu karang & pesisir Nusantara.',
    ogTitle: 'OG Nata Bahari "2026"',
    ogDescription: 'Dukung pelestarian pesisir Indonesia.',
    ogImage: '/src/assets/images/hero_coral_reef_1794819970201.jpg',
    ogType: 'article',
    ogSiteName: 'Yayasan Nata Bahari',
    updatedAt: '2026-11-16T00:00:00Z',
  });

  assert.match(updated, /<title>Nata Bahari "Lestari" &lt;2026&gt;<\/title>/);
  assert.match(updated, /<meta property="og:title" content="OG Nata Bahari &quot;2026&quot;" \/>/);
  assert.match(updated, /<meta property="og:type" content="article" \/>/);
  assert.match(updated, /<meta property="og:site_name" content="Yayasan Nata Bahari" \/>/);
  assert.match(updated, /<meta property="og:image" content="\/src\/assets\/images\/hero_coral_reef_1794819970201\.jpg" \/>/);
});

import {
  GTRANSLATE_DEFAULT_LANGUAGE,
  buildGTranslatePair,
  buildGTranslateSettings,
  buildGoogTransCookieValue,
  getLanguageOption,
  isSupportedLanguage,
  parseGoogTransCookie,
  parseStoredGTranslateLang,
} from './gtranslate';

test('gtranslate helpers validate languages and build translation pairs safely', () => {
  assert.equal(isSupportedLanguage('id'), true);
  assert.equal(isSupportedLanguage('en'), true);
  assert.equal(isSupportedLanguage('zh-CN'), true);
  assert.equal(isSupportedLanguage('xx-INVALID'), false);

  assert.equal(buildGTranslatePair('en'), 'id|en');
  assert.equal(buildGTranslatePair('invalid-code'), `id|${GTRANSLATE_DEFAULT_LANGUAGE}`);
  assert.equal(buildGoogTransCookieValue('id', 'ja'), '/id/ja');
  assert.equal(getLanguageOption('unknown').code, 'id');
});

test('gtranslate cookie and localStorage parsers extract valid target languages', () => {
  assert.equal(parseGoogTransCookie('session=abc; googtrans=/id/en; theme=light'), 'en');
  assert.equal(parseGoogTransCookie('googtrans=%2Fid%2Fzh-CN'), 'zh-CN');
  assert.equal(parseGoogTransCookie('googtrans=/id/unknown'), null);
  assert.equal(parseGoogTransCookie(''), null);

  assert.equal(
    parseStoredGTranslateLang(JSON.stringify({ srcLang: 'id', tgtLang: 'nl' })),
    'nl'
  );
  assert.equal(
    parseStoredGTranslateLang(JSON.stringify({ srcLang: 'id', tgtLang: 'bad' })),
    null
  );
  assert.equal(parseStoredGTranslateLang('{broken-json'), null);
});

test('buildGTranslateSettings returns valid lc.js settings object', () => {
  const settings = buildGTranslateSettings();
  assert.equal(settings.default_language, 'id');
  assert.equal(settings.wrapper_selector, '.gtranslate_wrapper');
  assert.equal(settings.native_language_names, true);
  assert.equal(settings.url_structure, 'none');
  assert.ok(settings.languages.includes('id'));
  assert.ok(settings.languages.includes('en'));
});

import {
  isProductionEnv,
  isSecureCookieRequest,
  resolveServerPort,
  resolveStorageDir,
} from '../../server/config';

test('server config resolves PORT, storage paths, and proxy-aware secure cookies safely', () => {
  assert.equal(resolveServerPort(undefined, 3000, 'production'), 3000);
  assert.equal(resolveServerPort('8080', 3000, 'production'), 8080);
  assert.equal(resolveServerPort('8080', 3000, 'development'), 3000);
  assert.equal(resolveServerPort('not-a-port', 3000, 'production'), 3000);
  assert.equal(resolveServerPort('99999', 3000, 'production'), 3000);

  assert.equal(isProductionEnv('production'), true);
  assert.equal(isProductionEnv('development'), false);

  assert.equal(resolveStorageDir('data', undefined, '/app'), '/app/data');
  assert.equal(resolveStorageDir('data', '/var/lib/nata-bahari', '/app'), '/var/lib/nata-bahari');

  assert.equal(
    isSecureCookieRequest({ nodeEnv: 'development', secure: true, forwardedProto: 'https' }),
    false
  );
  assert.equal(
    isSecureCookieRequest({ nodeEnv: 'production', secure: false, forwardedProto: 'https' }),
    true
  );
  assert.equal(
    isSecureCookieRequest({ nodeEnv: 'production', secure: false, forwardedProto: 'http' }),
    false
  );
});

