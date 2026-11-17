import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { db } from './db.ts';
import type { AdminRole, AdminUser } from '../src/types/foundation.ts';

export const SESSION_COOKIE_NAME = 'nb_admin_session';
const SESSION_TTL_HOURS = 24;
const SESSION_SECRET = process.env.SESSION_SECRET || 'nata-bahari-local-session-secret-2026';

export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

function hashToken(rawToken: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(rawToken).digest('hex');
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) {
      result[key] = decodeURIComponent(value);
    }
  }
  return result;
}

export function createSession(adminId: number): { rawToken: string; expiresAt: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (admin_id, token_hash, expires_at) VALUES (?, ?, ?)').run(
    adminId,
    tokenHash,
    expiresAt
  );

  return { rawToken, expiresAt };
}

export function deleteSessionByRawToken(rawToken: string): void {
  const tokenHash = hashToken(rawToken);
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function getAdminFromRequest(req: Request): AdminUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const row = db
    .prepare(
      `SELECT a.id, a.email, a.name, a.role, s.expires_at
       FROM sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.token_hash = ?`
    )
    .get(tokenHash) as
    | {
        id: number;
        email: string;
        name: string;
        role: AdminRole;
        expires_at: string;
      }
    | undefined;

  if (!row) return null;

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const admin = getAdminFromRequest(req);
  if (!admin || (admin.role !== 'super_admin' && admin.role !== 'editor')) {
    res.status(401).json({ error: 'Sesi administrator tidak valid atau telah berakhir.' });
    return;
  }
  req.admin = admin;
  next();
}
