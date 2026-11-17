import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import type {
  AboutContent,
  BannerSlide,
  ContactEntry,
  OgType,
  PortfolioPost,
  SiteMetadata,
  Subscription,
} from '../src/types/foundation.ts';
import { resolveStorageDir } from './config.ts';

const DATA_DIR = resolveStorageDir('data', process.env.DATA_DIR);
const DB_PATH = path.join(DATA_DIR, 'nata_bahari.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'super_admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      kicker TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      image_url TEXT NOT NULL,
      cta_label TEXT NOT NULL DEFAULT 'Jelajahi Program',
      cta_href TEXT NOT NULL DEFAULT '/portfolio',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS portfolio_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      activity_date TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS about_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      summary_title TEXT NOT NULL,
      summary_body TEXT NOT NULL,
      vision_title TEXT NOT NULL,
      vision_body TEXT NOT NULL,
      mission_title TEXT NOT NULL,
      mission_items_json TEXT NOT NULL,
      background_title TEXT NOT NULL,
      background_body TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      rich_text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_metadata (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_title TEXT NOT NULL,
      site_description TEXT NOT NULL,
      og_title TEXT NOT NULL,
      og_description TEXT NOT NULL,
      og_image TEXT NOT NULL,
      og_type TEXT NOT NULL DEFAULT 'website',
      og_site_name TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedDatabaseIfEmpty();
}

function seedDatabaseIfEmpty(): void {
  const adminCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM admins').get() as { cnt: number };
  if (adminCountRow.cnt === 0) {
    const defaultPass = process.env.ADMIN_SEED_PASSWORD || 'NataBahari2026!';
    db.prepare(
      'INSERT INTO admins (email, name, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run('admin@natabahari.or.id', 'Pengurus Utama Nata Bahari', hashPassword(defaultPass), 'super_admin');
  }

  const bannerCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM banners').get() as { cnt: number };
  if (bannerCountRow.cnt === 0) {
    const seedBanners = [
      {
        sortOrder: 1,
        kicker: 'Terumbu Karang',
        title: 'Menjaga Jantung Ekosistem Terumbu Karang Nusantara',
        subtitle: 'Program rehabilitasi karang berbasis sains bersama komunitas penyelam lokal di Sulawesi Utara dan Nusa Tenggara.',
        imageUrl: '/src/assets/images/hero_coral_reef_1794819970201.jpg',
        ctaLabel: 'Lihat Portofolio',
        ctaHref: '/portfolio',
      },
      {
        sortOrder: 2,
        kicker: 'Hutan Mangrove',
        title: 'Pemulihan Hutan Mangrove Penahan Abrasi dan Karbon Biru',
        subtitle: 'Mengembalikan ketahanan garis pantai melalui pembibitan mangrove partisipatif di muara sungai pesisir Jawa dan Sumatra.',
        imageUrl: '/src/assets/images/hero_mangrove_coast_1794819970598.jpg',
        ctaLabel: 'Program Mangrove',
        ctaHref: '/portfolio',
      },
      {
        sortOrder: 3,
        kicker: 'Sekolah Pesisir',
        title: 'Menumbuhkan Generasi Penjaga Laut Sejak Dini',
        subtitle: 'Kurikulum lapangan interaktif yang mengenalkan ekologi pasang surut dan literasi maritim kepada pelajar pesisir.',
        imageUrl: '/src/assets/images/hero_coastal_education_1794819971061.jpg',
        ctaLabel: 'Tentang Kami',
        ctaHref: '/tentang-kita',
      },
      {
        sortOrder: 4,
        kicker: 'Ekspedisi Phinisi',
        title: 'Menjelajah Kepulauan dengan Kapal Riset Tradisional Phinisi',
        subtitle: 'Pemetaan keanekaragaman hayati laut dalam dan dialog konservasi lintas pulau terpencil di Indonesia Timur.',
        imageUrl: '/src/assets/images/hero_traditional_boat_1794819971410.jpg',
        ctaLabel: 'Catatan Ekspedisi',
        ctaHref: '/portfolio',
      },
      {
        sortOrder: 5,
        kicker: 'Bersih Pantai',
        title: 'Kolaborasi Warga Mengurangi Limbah Plastik di Garis Pantai',
        subtitle: 'Inisiatif pengumpulan, pemilahan, dan sirkularitas sampah pesisir yang digerakkan langsung oleh desa nelayan.',
        imageUrl: '/src/assets/images/hero_beach_cleanup_1794819972342.jpg',
        ctaLabel: 'Gabung Gerakan',
        ctaHref: '/tentang-kita',
      },
      {
        sortOrder: 6,
        kicker: 'Pembibitan Karang',
        title: 'Pembibitan Fragmen Karang Tahan Suhu Hangat Laut',
        subtitle: 'Pemantauan berkala rak transplantasi karang untuk mempercepat pemulihan habitat ikan karang ekonomis.',
        imageUrl: '/src/assets/images/hero_coral_nursery_1794819972631.jpg',
        ctaLabel: 'Lihat Dokumentasi',
        ctaHref: '/portfolio',
      },
      {
        sortOrder: 7,
        kicker: 'Penyu & Lamun',
        title: 'Menjaga Koridor Padang Lamun dan Habitat Penyu Hijau',
        subtitle: 'Pengawasan sarang alami serta konservasi padang lamun sebagai sumber pakan utama penyu dan dugong.',
        imageUrl: '/src/assets/images/hero_sea_turtle_1794819972561.jpg',
        ctaLabel: 'Jelajahi Program',
        ctaHref: '/portfolio',
      },
      {
        sortOrder: 8,
        kicker: 'Masa Depan',
        title: 'Merawat Kedaulatan Ekologi Kepulauan Indonesia',
        subtitle: 'Kemitraan jangka panjang antara peneliti, pemerintah daerah, dan masyarakat adat laut demi samudra lestari.',
        imageUrl: '/src/assets/images/hero_karst_archipelago_1794819986385.jpg',
        ctaLabel: 'Hubungi Yayasan',
        ctaHref: '/tentang-kita',
      },
    ];

    const insertBanner = db.prepare(`
      INSERT INTO banners (sort_order, kicker, title, subtitle, image_url, cta_label, cta_href)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of seedBanners) {
      insertBanner.run(b.sortOrder, b.kicker, b.title, b.subtitle, b.imageUrl, b.ctaLabel, b.ctaHref);
    }
  }

  const postCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM portfolio_posts').get() as { cnt: number };
  if (postCountRow.cnt === 0) {
    const seedPosts = [
      {
        title: 'Transplantasi 650 Fragmen Karang di Taman Laut Teluk Tomini',
        category: 'Restorasi Karang',
        location: 'Gorontalo, Sulawesi',
        activityDate: '2026-10-28',
        imageUrl: '/src/assets/images/hero_coral_nursery_1794819972631.jpg',
        description:
          'Tim peneliti kelautan Yayasan Nata Bahari bersama kelompok penyelam desa pesisir menyelesaikan pemasangan 12 meja pembibitan karang tipe Acropora di kedalaman 8 meter. Pemantauan awal menunjukkan tingkat kelangsungan hidup mencapai 91% dalam 60 hari pertama serta mulai kembalinya kawanan ikan damselfish dan butterflyfish.',
      },
      {
        title: 'Penanaman 2.400 Bibit Rhizophora di Muara Pesisir Demak',
        category: 'Mangrove & Karbon Biru',
        location: 'Demak, Jawa Tengah',
        activityDate: '2026-10-14',
        imageUrl: '/src/assets/images/hero_mangrove_coast_1794819970598.jpg',
        description:
          'Bersama 85 warga pesisir dan mahasiswa relawan, Nata Bahari memperluas zona penyangga mangrove seluas 1,8 hektare guna meredam gelombang pasang tahunan. Seluruh bibit dibudidayakan langsung di kebun pembibitan milik kelompok tani tambak setempat.',
      },
      {
        title: 'Kelas Lapangan Ekologi Pasang Surut bagi 40 Pelajar Pesisir Selatan',
        category: 'Edukasi Bahari',
        location: 'Gunungkidul, Yogyakarta',
        activityDate: '2026-09-29',
        imageUrl: '/src/assets/images/hero_coastal_education_1794819971061.jpg',
        description:
          'Siswa sekolah dasar dan menengah pesisir diajak mengamati langsung biodiversitas kolam pasang surut menggunakan buku saku identifikasi biota laut. Program Sekolah Pesisir bertujuan membangun pemahaman ilmiah tanpa memisahkan anak-anak dari kearifan lokal nelayan.',
      },
      {
        title: 'Audit Sampah Pesisir & Pengolahan Jaring Bekas Nelayan',
        category: 'Komunitas Pesisir',
        location: 'Banyuwangi, Jawa Timur',
        activityDate: '2026-09-12',
        imageUrl: '/src/assets/images/hero_beach_cleanup_1794819972342.jpg',
        description:
          'Sebanyak 420 kilogram limbah plastik dan jaring ikan terbengkalai (ghost nets) berhasil dikumpulkan dan dipilah sepanjang 3,5 kilometer garis pantai. Material nilon bermutu tinggi disalurkan ke mitra daur ulang lokal untuk diproses menjadi kerajinan tali tambat.',
      },
      {
        title: 'Pelayaran Riset & Konsultasi Kampung Adat Kepulauan Banda',
        category: 'Ekspedisi Riset',
        location: 'Maluku Tengah',
        activityDate: '2026-08-21',
        imageUrl: '/src/assets/images/hero_traditional_boat_1794819971410.jpg',
        description:
          'Selama 14 hari pelayaran, kapal riset mitra kami menyambangi enam pulau terluar untuk mendokumentasikan praktik Sasi Laut tradisional dan memetakan zona perlindungan terumbu karang berbasis masyarakat.',
      },
      {
        title: 'Pemantauan Padang Lamun & Jalur Ruaya Penyu Hijau',
        category: 'Konservasi Satwa',
        location: 'Berau, Kalimantan Timur',
        activityDate: '2026-08-03',
        imageUrl: '/src/assets/images/hero_sea_turtle_1794819972561.jpg',
        description:
          'Survei transek bawah air mencatat kepadatan lamun Enhalus acoroides yang sehat sebagai area mencari makan utama penyu hijau dewasa. Data spasial ini diserahkan kepada pengelola kawasan konservasi perairan daerah.',
      },
    ];

    const insertPost = db.prepare(`
      INSERT INTO portfolio_posts (title, category, location, activity_date, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const p of seedPosts) {
      insertPost.run(p.title, p.category, p.location, p.activityDate, p.imageUrl, p.description);
    }
  }

  const aboutRow = db.prepare('SELECT COUNT(*) AS cnt FROM about_content').get() as { cnt: number };
  if (aboutRow.cnt === 0) {
    const missionItems = [
      'Menjalankan restorasi terumbu karang, mangrove, dan padang lamun berbasis data ekologis jangka panjang.',
      'Memperkuat kapasitas ekonomi dan tata kelola sumber daya laut bagi masyarakat pesisir dan nelayan skala kecil.',
      'Menyelenggarakan pendidikan literasi maritim yang memadukan sains kelautan modern dan kearifan lokal Nusantara.',
      'Membangun kolaborasi terbuka antara akademisi, pembuat kebijakan, filantropi, dan relawan lintas daerah.',
    ];

    db.prepare(`
      INSERT INTO about_content (
        id, summary_title, summary_body, vision_title, vision_body,
        mission_title, mission_items_json, background_title, background_body
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Merawat Samudra, Menguatkan Kehidupan Pesisir Indonesia',
      'Yayasan Nata Bahari adalah organisasi nirlaba independen yang berdedikasi pada pemulihan ekosistem laut dangkal, penguatan literasi maritim generasi muda, serta pendampingan desa pesisir yang berdaulat secara ekologis dan ekonomi.',
      'Visi Yayasan',
      'Terwujudnya ekosistem laut dan pesisir Nusantara yang pulih, produktif, dan dikelola secara adil oleh masyarakat bahari yang berpengetahuan.',
      'Misi Utama',
      JSON.stringify(missionItems),
      'Latar Belakang & Sejarah',
      'Didirikan pada tahun 2019 oleh sekelompok peneliti kelautan, pendidik pesisir, dan pegiat konservasi di Jakarta dan Makassar, Yayasan Nata Bahari lahir dari kebutuhan mendesak untuk menjembatani riset ilmiah dengan aksi nyata di lapangan.\n\nAlih-alih bekerja secara terpisah, setiap program kami dirancang bersama kepala adat, kelompok nelayan, dan sekolah setempat agar rehabilitasi karang maupun hutan mangrove memberikan dampak ekologis sekaligus manfaat sosial yang berkelanjutan.'
    );
  }

  const contactCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM contact_entries').get() as { cnt: number };
  if (contactCountRow.cnt === 0) {
    const seedContacts = [
      {
        label: 'Sekretariat & Korespondensi Umum',
        richText:
          'Untuk pertanyaan program, laporan tahunan, atau permohonan kunjungan riset, kirimkan surat elektronik ke [sekretariat@natabahari.or.id](mailto:sekretariat@natabahari.or.id).',
        sortOrder: 1,
      },
      {
        label: 'Kantor & Pusat Dokumentasi Maritim',
        richText:
          'Kunjungi ruang baca dan sekretariat lapangan kami di [Kawasan Dusun IV Kalangan, Pulau Pahawang, Pardasuka, Kabupaten Pesawaran, Lampung 35453](https://maps.google.com/?q=Dusun+IV+Kalangan+Pulau+Pahawang+Pardasuka+Kabupaten+Pesawaran+Lampung+35453) setiap Senin hingga Jumat pukul 09.00–17.00 WIB.',
        sortOrder: 2,
      },
      {
        label: 'Kanal Media Sosial & Jurnal Lapangan',
        richText:
          'Ikuti pembaruan foto ekspedisi harian di [Instagram @natabahari.id](https://instagram.com/natabahari.id), diskusi kebijakan laut di [Twitter @natabahari](https://twitter.com/natabahari), jaringan kemitraan di [LinkedIn Yayasan Nata Bahari](https://linkedin.com/company/yayasan-nata-bahari), atau tonton film dokumenter pendek di [YouTube Nata Bahari](https://youtube.com/@natabahari).',
        sortOrder: 3,
      },
      {
        label: 'Kemitraan & Donasi Program',
        richText:
          'Institusi dan mitra filantropi dapat berdiskusi langsung bersama tim pengelola dana abadi melalui [kemitraan@natabahari.or.id](mailto:kemitraan@natabahari.or.id) atau telepon kantor [+62 21 555 0148](tel:+62215550148).',
        sortOrder: 4,
      },
    ];

    const insertContact = db.prepare(
      'INSERT INTO contact_entries (label, rich_text, sort_order) VALUES (?, ?, ?)'
    );
    for (const c of seedContacts) {
      insertContact.run(c.label, c.richText, c.sortOrder);
    }
  } else {
    db.prepare(
      `UPDATE contact_entries
       SET rich_text = REPLACE(
         REPLACE(
           rich_text,
           '[Kawasan Pelabuhan Sunda Kelapa, Jakarta Utara](https://maps.google.com/?q=Pelabuhan+Sunda+Kelapa+Jakarta+Utara)',
           '[Kawasan Dusun IV Kalangan, Pulau Pahawang, Pardasuka, Kabupaten Pesawaran, Lampung 35453](https://maps.google.com/?q=Dusun+IV+Kalangan+Pulau+Pahawang+Pardasuka+Kabupaten+Pesawaran+Lampung+35453)'
         ),
         'Kawasan Pelabuhan Sunda Kelapa, Jakarta Utara',
         'Kawasan Dusun IV Kalangan, Pulau Pahawang, Pardasuka, Kabupaten Pesawaran, Lampung 35453'
       )
       WHERE rich_text LIKE '%Kawasan Pelabuhan Sunda Kelapa, Jakarta Utara%'`
    ).run();
  }

  const subCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM subscriptions').get() as { cnt: number };
  if (subCountRow.cnt === 0) {
    const insertSub = db.prepare('INSERT INTO subscriptions (email, name) VALUES (?, ?)');
    insertSub.run('ratna.maritim@univ-kelautan.ac.id', 'Ratna Kusuma');
    insertSub.run('hendra.nelayan@pesisirnusantara.org', 'Hendra Wijaya');
    insertSub.run('redaksi@jurnalbahari.id', 'Tim Redaksi Bahari');
  }

  ensureSiteMetadataRow();
}

function ensureSiteMetadataRow(): void {
  const row = db.prepare('SELECT COUNT(*) AS cnt FROM site_metadata').get() as { cnt: number };
  if (row.cnt === 0) {
    db.prepare(
      `INSERT INTO site_metadata (
        id, site_title, site_description, og_title, og_description, og_image, og_type, og_site_name
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      'Yayasan Nata Bahari — Konservasi Pesisir & Literasi Maritim',
      'Yayasan Nata Bahari adalah lembaga nirlaba yang bergerak di bidang konservasi ekosistem pesisir, restorasi terumbu karang, dan pemberdayaan masyarakat bahari Indonesia.',
      'Yayasan Nata Bahari — Konservasi Pesisir & Literasi Maritim',
      'Profil resmi, portofolio program lapangan, dan kanal publik Yayasan Nata Bahari.',
      '/src/assets/images/hero_coral_reef_1794819970201.jpg',
      'website',
      'Yayasan Nata Bahari'
    );
  }
}

export function listBanners(): BannerSlide[] {
  const rows = db
    .prepare(
      `SELECT id, sort_order, kicker, title, subtitle, image_url, cta_label, cta_href, updated_at
       FROM banners ORDER BY sort_order ASC, id ASC`
    )
    .all() as Array<{
    id: number;
    sort_order: number;
    kicker: string;
    title: string;
    subtitle: string;
    image_url: string;
    cta_label: string;
    cta_href: string;
    updated_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    sortOrder: r.sort_order,
    kicker: r.kicker,
    title: r.title,
    subtitle: r.subtitle,
    imageUrl: r.image_url,
    ctaLabel: r.cta_label,
    ctaHref: r.cta_href,
    updatedAt: r.updated_at,
  }));
}

export function listPortfolioPosts(): PortfolioPost[] {
  const rows = db
    .prepare(
      `SELECT id, title, category, location, activity_date, image_url, description, created_at, updated_at
       FROM portfolio_posts ORDER BY activity_date DESC, id DESC`
    )
    .all() as Array<{
    id: number;
    title: string;
    category: string;
    location: string;
    activity_date: string;
    image_url: string;
    description: string;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    location: r.location,
    activityDate: r.activity_date,
    imageUrl: r.image_url,
    description: r.description,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getAboutContent(): AboutContent {
  const row = db
    .prepare(
      `SELECT id, summary_title, summary_body, vision_title, vision_body,
              mission_title, mission_items_json, background_title, background_body, updated_at
       FROM about_content WHERE id = 1`
    )
    .get() as {
    id: number;
    summary_title: string;
    summary_body: string;
    vision_title: string;
    vision_body: string;
    mission_title: string;
    mission_items_json: string;
    background_title: string;
    background_body: string;
    updated_at: string;
  };

  let missionItems: string[] = [];
  try {
    missionItems = JSON.parse(row.mission_items_json) as string[];
  } catch {
    missionItems = [];
  }

  return {
    id: row.id,
    summaryTitle: row.summary_title,
    summaryBody: row.summary_body,
    visionTitle: row.vision_title,
    visionBody: row.vision_body,
    missionTitle: row.mission_title,
    missionItems,
    backgroundTitle: row.background_title,
    backgroundBody: row.background_body,
    updatedAt: row.updated_at,
  };
}

export function listContactEntries(): ContactEntry[] {
  const rows = db
    .prepare('SELECT id, label, rich_text, sort_order FROM contact_entries ORDER BY sort_order ASC, id ASC')
    .all() as Array<{
    id: number;
    label: string;
    rich_text: string;
    sort_order: number;
  }>;

  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    richText: r.rich_text,
    sortOrder: r.sort_order,
  }));
}

export function listSubscriptions(): Subscription[] {
  const rows = db
    .prepare('SELECT id, email, name, created_at FROM subscriptions ORDER BY created_at DESC, id DESC')
    .all() as Array<{
    id: number;
    email: string;
    name: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    createdAt: r.created_at,
  }));
}

export function getSiteMetadata(): SiteMetadata {
  ensureSiteMetadataRow();
  const row = db
    .prepare(
      `SELECT id, site_title, site_description, og_title, og_description, og_image, og_type, og_site_name, updated_at
       FROM site_metadata WHERE id = 1`
    )
    .get() as {
    id: number;
    site_title: string;
    site_description: string;
    og_title: string;
    og_description: string;
    og_image: string;
    og_type: OgType;
    og_site_name: string;
    updated_at: string;
  };

  return {
    id: row.id,
    siteTitle: row.site_title,
    siteDescription: row.site_description,
    ogTitle: row.og_title,
    ogDescription: row.og_description,
    ogImage: row.og_image,
    ogType: row.og_type,
    ogSiteName: row.og_site_name,
    updatedAt: row.updated_at,
  };
}

export function saveSiteMetadata(input: {
  siteTitle: string;
  siteDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: OgType;
  ogSiteName: string;
}): SiteMetadata {
  ensureSiteMetadataRow();
  db.prepare(
    `UPDATE site_metadata
     SET site_title = ?, site_description = ?, og_title = ?, og_description = ?,
         og_image = ?, og_type = ?, og_site_name = ?, updated_at = datetime('now')
     WHERE id = 1`
  ).run(
    input.siteTitle,
    input.siteDescription,
    input.ogTitle,
    input.ogDescription,
    input.ogImage,
    input.ogType,
    input.ogSiteName
  );
  return getSiteMetadata();
}
