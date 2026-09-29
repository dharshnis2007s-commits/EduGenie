import { randomBytes, pbkdf2Sync, randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  education_level: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Password hashing with PBKDF2
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  const [salt, originalHash] = combinedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Session creation
export function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex');
  const id = randomUUID();
  // 30 days expiry
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  stmt.run(id, userId, token, expiresAt);
  return token;
}

export function deleteSession(token: string): void {
  const stmt = db.prepare(`DELETE FROM sessions WHERE token = ?`);
  stmt.run(token);
}

// Get user from token
export function getUserByToken(token: string): AuthenticatedUser | null {
  const stmt = db.prepare(`
    SELECT u.id, u.email, p.full_name, p.avatar_url, p.education_level
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    JOIN profiles p ON p.user_id = u.id
    WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
  `);
  const row = stmt.get(token) as any;
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    education_level: row.education_level,
  };
}

// Middleware requiring authentication
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      data: null,
      error: { message: 'Authentication required. Please log in.' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = getUserByToken(token);
  if (!user) {
    res.status(401).json({
      success: false,
      data: null,
      error: { message: 'Session expired or invalid. Please log in again.' },
    });
    return;
  }

  req.user = user;
  next();
}

// Middleware allowing optional authentication (e.g. for guest testing or exploring)
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = getUserByToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}
