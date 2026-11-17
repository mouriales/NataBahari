import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  db,
  getAboutContent,
  getSiteMetadata,
  initializeDatabase,
  listBanners,
  listContactEntries,
  listPortfolioPosts,
  listSubscriptions,
  saveSiteMetadata,
  verifyPassword,
} from './server/db.ts';
import {
  SESSION_COOKIE_NAME,
  createSession,
  deleteSessionByRawToken,
  getAdminFromRequest,
  parseCookies,
  requireAdmin,
  type AuthenticatedRequest,
} from './server/auth.ts';
import {
  validateBannerInput,
  validateContactInput,
  validateEmail,
  validateMetadataInput,
  validatePortfolioPostInput,
} from './src/utils/validation.ts';
import { injectHtmlMetadata } from './src/utils/seo.ts';
import type { OgType } from './src/types/foundation.ts';

const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

initializeDatabase();

async function startServer(): Promise<void> {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Public Health & Site Bootstrap
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/public/site', (_req, res) => {
    res.json({
      banners: listBanners(),
      posts: listPortfolioPosts(),
      about: getAboutContent(),
      contacts: listContactEntries(),
      metadata: getSiteMetadata(),
    });
  });

  // Public Newsletter Subscription
  app.post('/api/subscriptions', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || '').trim().slice(0, 120);

    const check = validateEmail(email);
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    const existing = db
      .prepare('SELECT id FROM subscriptions WHERE email = ?')
      .get(email) as { id: number } | undefined;

    if (existing) {
      res.status(409).json({ error: 'Alamat email ini sudah terdaftar dalam daftar buletin kami.' });
      return;
    }

    const result = db
      .prepare('INSERT INTO subscriptions (email, name) VALUES (?, ?)')
      .run(email, name);

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      email,
      name,
      message: 'Terima kasih telah berlangganan buletin Yayasan Nata Bahari.',
    });
  });

  // Admin Auth Endpoints
  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Email dan kata sandi wajib diisi.' });
      return;
    }

    const admin = db
      .prepare('SELECT id, email, name, password_hash, role FROM admins WHERE email = ?')
      .get(email) as
      | {
          id: number;
          email: string;
          name: string;
          password_hash: string;
          role: 'super_admin' | 'editor';
        }
      | undefined;

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      res.status(401).json({ error: 'Email atau kata sandi administrator tidak sesuai.' });
      return;
    }

    const { rawToken } = createSession(admin.id);
    res.cookie(SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE_NAME];
    if (rawToken) {
      deleteSessionByRawToken(rawToken);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const admin = getAdminFromRequest(req);
    res.json({ admin: admin || null });
  });

  // Protected Admin Media Upload (supports base64 data URI from file input)
  app.post('/api/admin/upload', requireAdmin, (req: AuthenticatedRequest, res) => {
    const dataUrl = String(req.body?.dataUrl || '');
    const match = /^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Format berkas tidak didukung. Gunakan PNG, JPG, atau WEBP.' });
      return;
    }

    const mimeSubtype = match[2] === 'jpeg' ? 'jpg' : match[2];
    const buffer = Buffer.from(match[3], 'base64');
    if (buffer.byteLength > 6 * 1024 * 1024) {
      res.status(413).json({ error: 'Ukuran gambar maksimal adalah 6 MB.' });
      return;
    }

    const filename = `nb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${mimeSubtype}`;
    const dest = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(dest, buffer);

    res.status(201).json({ url: `/uploads/${filename}` });
  });

  // Protected Admin Banner Carousel Management (8 Slides)
  app.put('/api/admin/banners/reorder', requireAdmin, (req: AuthenticatedRequest, res) => {
    const orderedIds = req.body?.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ error: 'Daftar urutan slide tidak valid.' });
      return;
    }

    db.exec('BEGIN');
    try {
      const updateStmt = db.prepare(
        "UPDATE banners SET sort_order = ?, updated_at = datetime('now') WHERE id = ?"
      );
      orderedIds.forEach((id, index) => {
        updateStmt.run(index + 1, Number(id));
      });
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }

    res.json({ banners: listBanners() });
  });

  app.put('/api/admin/banners/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const kicker = String(req.body?.kicker || '').trim();
    const title = String(req.body?.title || '').trim();
    const subtitle = String(req.body?.subtitle || '').trim();
    const imageUrl = String(req.body?.imageUrl || '').trim();
    const ctaLabel = String(req.body?.ctaLabel || 'Jelajahi Program').trim();
    const ctaHref = String(req.body?.ctaHref || '/portfolio').trim();

    const check = validateBannerInput({ title, subtitle, imageUrl });
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    const info = db
      .prepare(
        `UPDATE banners
         SET kicker = ?, title = ?, subtitle = ?, image_url = ?, cta_label = ?, cta_href = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
      .run(kicker || 'Program Unggulan', title, subtitle, imageUrl, ctaLabel, ctaHref, id);

    if (info.changes === 0) {
      res.status(404).json({ error: 'Slide banner tidak ditemukan.' });
      return;
    }

    res.json({ banners: listBanners() });
  });

  // Protected Admin Portfolio Posts CRUD
  app.post('/api/admin/posts', requireAdmin, (req: AuthenticatedRequest, res) => {
    const title = String(req.body?.title || '').trim();
    const category = String(req.body?.category || '').trim();
    const location = String(req.body?.location || '').trim() || 'Indonesia';
    const activityDate =
      String(req.body?.activityDate || '').trim() || new Date().toISOString().slice(0, 10);
    const imageUrl = String(req.body?.imageUrl || '').trim();
    const description = String(req.body?.description || '').trim();

    const check = validatePortfolioPostInput({ title, category, imageUrl, description });
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    db.prepare(
      `INSERT INTO portfolio_posts (title, category, location, activity_date, image_url, description)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(title, category, location, activityDate, imageUrl, description);

    res.status(201).json({ posts: listPortfolioPosts() });
  });

  app.put('/api/admin/posts/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const title = String(req.body?.title || '').trim();
    const category = String(req.body?.category || '').trim();
    const location = String(req.body?.location || '').trim() || 'Indonesia';
    const activityDate =
      String(req.body?.activityDate || '').trim() || new Date().toISOString().slice(0, 10);
    const imageUrl = String(req.body?.imageUrl || '').trim();
    const description = String(req.body?.description || '').trim();

    const check = validatePortfolioPostInput({ title, category, imageUrl, description });
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    const info = db
      .prepare(
        `UPDATE portfolio_posts
         SET title = ?, category = ?, location = ?, activity_date = ?, image_url = ?, description = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
      .run(title, category, location, activityDate, imageUrl, description, id);

    if (info.changes === 0) {
      res.status(404).json({ error: 'Postingan portofolio tidak ditemukan.' });
      return;
    }

    res.json({ posts: listPortfolioPosts() });
  });

  app.delete('/api/admin/posts/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const info = db.prepare('DELETE FROM portfolio_posts WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Postingan portofolio tidak ditemukan.' });
      return;
    }
    res.json({ posts: listPortfolioPosts() });
  });

  // Protected Admin About Content & Interactive Contacts
  app.put('/api/admin/about', requireAdmin, (req: AuthenticatedRequest, res) => {
    const summaryTitle = String(req.body?.summaryTitle || '').trim();
    const summaryBody = String(req.body?.summaryBody || '').trim();
    const visionTitle = String(req.body?.visionTitle || '').trim();
    const visionBody = String(req.body?.visionBody || '').trim();
    const missionTitle = String(req.body?.missionTitle || '').trim();
    const missionItemsRaw = Array.isArray(req.body?.missionItems) ? req.body.missionItems : [];
    const missionItems = missionItemsRaw
      .map((item: unknown) => String(item || '').trim())
      .filter((item: string) => item.length > 0);
    const backgroundTitle = String(req.body?.backgroundTitle || '').trim();
    const backgroundBody = String(req.body?.backgroundBody || '').trim();

    if (!summaryTitle || !summaryBody || !visionBody || !backgroundBody) {
      res.status(400).json({ error: 'Ringkasan, visi, dan latar belakang yayasan wajib diisi.' });
      return;
    }

    db.prepare(
      `UPDATE about_content
       SET summary_title = ?, summary_body = ?, vision_title = ?, vision_body = ?,
           mission_title = ?, mission_items_json = ?, background_title = ?, background_body = ?,
           updated_at = datetime('now')
       WHERE id = 1`
    ).run(
      summaryTitle,
      summaryBody,
      visionTitle || 'Visi Yayasan',
      visionBody,
      missionTitle || 'Misi Utama',
      JSON.stringify(missionItems),
      backgroundTitle || 'Latar Belakang & Sejarah',
      backgroundBody
    );

    res.json({ about: getAboutContent() });
  });

  app.post('/api/admin/contacts', requireAdmin, (req: AuthenticatedRequest, res) => {
    const label = String(req.body?.label || '').trim();
    const richText = String(req.body?.richText || '').trim();

    const check = validateContactInput({ label, richText });
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    const maxRow = db
      .prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM contact_entries')
      .get() as { max_order: number };

    db.prepare('INSERT INTO contact_entries (label, rich_text, sort_order) VALUES (?, ?, ?)').run(
      label,
      richText,
      maxRow.max_order + 1
    );

    res.status(201).json({ contacts: listContactEntries() });
  });

  app.put('/api/admin/contacts/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const label = String(req.body?.label || '').trim();
    const richText = String(req.body?.richText || '').trim();

    const check = validateContactInput({ label, richText });
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    const info = db
      .prepare('UPDATE contact_entries SET label = ?, rich_text = ? WHERE id = ?')
      .run(label, richText, id);

    if (info.changes === 0) {
      res.status(404).json({ error: 'Kontak tidak ditemukan.' });
      return;
    }

    res.json({ contacts: listContactEntries() });
  });

  app.delete('/api/admin/contacts/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM contact_entries WHERE id = ?').run(id);
    res.json({ contacts: listContactEntries() });
  });

  // Protected Admin Subscriptions List
  app.get('/api/admin/subscriptions', requireAdmin, (_req, res) => {
    res.json({ subscriptions: listSubscriptions() });
  });

  app.delete('/api/admin/subscriptions/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM subscriptions WHERE id = ?').run(id);
    res.json({ subscriptions: listSubscriptions() });
  });

  // Protected Admin Site Metadata & OpenGraph Configuration
  app.put('/api/admin/metadata', requireAdmin, (req: AuthenticatedRequest, res) => {
    const siteTitle = String(req.body?.siteTitle || '').trim();
    const siteDescription = String(req.body?.siteDescription || '').trim();
    const ogTitle = String(req.body?.ogTitle || '').trim();
    const ogDescription = String(req.body?.ogDescription || '').trim();
    const ogImage =
      String(req.body?.ogImage || '').trim() ||
      '/src/assets/images/hero_coral_reef_1794819970201.jpg';
    const rawOgType = String(req.body?.ogType || 'website').trim();
    const ogType: OgType =
      rawOgType === 'article' || rawOgType === 'profile' ? rawOgType : 'website';
    const ogSiteName = String(req.body?.ogSiteName || '').trim();

    const check = validateMetadataInput({
      siteTitle,
      siteDescription,
      ogTitle,
      ogDescription,
      ogSiteName,
    });
    if (!check.valid) {
      res.status(400).json({ error: check.error });
      return;
    }

    const updated = saveSiteMetadata({
      siteTitle,
      siteDescription,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      ogSiteName,
    });

    // Persist metadata tags into index.html (and dist/index.html if built)
    const htmlTargets = [
      path.resolve(process.cwd(), 'index.html'),
      path.resolve(process.cwd(), 'dist', 'index.html'),
    ];
    for (const htmlFile of htmlTargets) {
      if (fs.existsSync(htmlFile)) {
        const currentHtml = fs.readFileSync(htmlFile, 'utf-8');
        const nextHtml = injectHtmlMetadata(currentHtml, updated);
        fs.writeFileSync(htmlFile, nextHtml, 'utf-8');
      }
    }

    res.json({ metadata: updated });
  });

  // Vite dev middleware or production static assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req, res) => {
      const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
      res.type('html').send(injectHtmlMetadata(html, getSiteMetadata()));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yayasan Nata Bahari server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
