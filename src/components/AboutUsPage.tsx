import type { AboutContent, ContactEntry } from '../types/foundation';
import { RichContactText } from './RichContactText';
import { SafeImage } from './SafeImage';

interface AboutUsPageProps {
  about: AboutContent;
  contacts: ContactEntry[];
}

export function AboutUsPage({ about, contacts }: AboutUsPageProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
      {/* Page Title & Lead */}
      <section className="space-y-6 border-b border-[#E2DFD5] pb-12">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-widest text-[#57606A]">
            Tentang Kita
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#18222F] leading-tight">
            {about.summaryTitle}
          </h1>
          <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed pt-2">
            {about.summaryBody}
          </p>
        </div>

        <div className="aspect-[16/9] max-h-[420px] w-full rounded-xl overflow-hidden border border-[#E2DFD5] bg-[#EFECE4]">
          <SafeImage
            src="/src/assets/images/hero_karst_archipelago_1794819986385.jpg"
            alt="Bentang laut kepulauan Indonesia tempat Yayasan Nata Bahari berkarya"
            fallbackTitle="Yayasan Nata Bahari"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Background / History */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#57606A]">
            01. Jati Diri
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18222F] mt-2">
            {about.backgroundTitle}
          </h2>
        </div>
        <div className="lg:col-span-8 space-y-4 max-w-prose">
          {about.backgroundBody.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-base text-[#374151] leading-relaxed ${
                idx === 0
                  ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#0F4C81]'
                  : ''
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-[#E2DFD5] py-12">
        <div className="bg-white border border-[#E2DFD5] rounded-lg p-7 space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-[#0F4C81]">
            02. Arah Strategis
          </p>
          <h2 className="font-serif text-2xl font-semibold text-[#18222F]">
            {about.visionTitle}
          </h2>
          <p className="text-base text-[#374151] leading-relaxed pt-1">
            {about.visionBody}
          </p>
        </div>

        <div className="bg-white border border-[#E2DFD5] rounded-lg p-7 space-y-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[#0F4C81]">
            03. Mandat Kerja
          </p>
          <h2 className="font-serif text-2xl font-semibold text-[#18222F]">
            {about.missionTitle}
          </h2>
          <ol className="space-y-3 pt-1">
            {about.missionItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-[#374151] leading-relaxed">
                <span className="font-mono tabular-nums text-xs font-semibold text-[#0F4C81] mt-1 shrink-0">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Interactive Contacts Section */}
      <section aria-labelledby="kontak-interaktif-heading" className="space-y-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-[#57606A]">
            04. Kontak & Kanal Resmi
          </p>
          <h2 id="kontak-interaktif-heading" className="font-serif text-2xl sm:text-3xl font-semibold text-[#18222F]">
            Hubungi dan Terhubung Langsung dengan Kami
          </h2>
          <p className="text-sm text-[#4B5563]">
            Pilih tautan langsung pada setiap kanal komunikasi di bawah ini untuk mengirim surat elektronik, membuka peta lokasi sekretariat, atau mengikuti dokumentasi resmi kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="interactive-contacts">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-[#E2DFD5] rounded-lg p-6 space-y-2"
            >
              <h3 className="text-sm font-semibold text-[#18222F]">
                {contact.label}
              </h3>
              <RichContactText
                text={contact.richText}
                className="text-sm text-[#4B5563] leading-relaxed"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
