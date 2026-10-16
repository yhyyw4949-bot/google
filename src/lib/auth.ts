import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db/store';
import { UserProfile } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'gap_super_secret_jwt_key_2026_secure_random';

interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  exp: number;
}

export function signToken(userId: string, email: string, role: 'customer' | 'admin'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const payload = Buffer.from(JSON.stringify({ userId, email, role, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as TokenPayload;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('gap_token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = db.getProfileById(payload.userId);
    if (!user || user.isSuspended) return null;

    return user;
  } catch {
    return null;
  }
}
