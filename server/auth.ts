import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, User } from './db.js';

// User token store: token -> userId (with expiry)
interface UserSession {
  userId: string;
  expiresAt: number;
}
const userSessions = new Map<string, UserSession>();

// Default session durations: 7 days for users, 12 hours for admin
const USER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// User sessions
export function createUserSession(userId: string): string {
  const token = generateSecureToken();
  userSessions.set(token, {
    userId,
    expiresAt: Date.now() + USER_SESSION_TTL_MS,
  });
  return token;
}

export function getUserFromToken(token: string): User | null {
  if (!token) return null;
  const session = userSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    userSessions.delete(token);
    return null;
  }
  return db.findUserById(session.userId) || null;
}

export function invalidateUserSession(token: string): void {
  userSessions.delete(token);
}

// Admin Auth
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'MOJ MARO';
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const actualPassword = getAdminPassword();
  if (!inputPassword || typeof inputPassword !== 'string') return false;
  // Constant time comparison
  const a = Buffer.from(inputPassword.trim());
  const b = Buffer.from(actualPassword.trim());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminSessionToken(): string {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS).toISOString();
  db.createAdminSession(token, expiresAt);
  return token;
}

// Express Middlewares
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireUserAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  req.user = user;
  next();
}

export function optionalUserAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = getUserFromToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['x-admin-token'] || req.headers.authorization;
  let token = '';

  if (typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  if (!token || !db.validateAdminSession(token)) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    return;
  }

  next();
}
