import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Environment-configured secret for signing admin JWT tokens
const getSecretKey = (): string => {
  return (
    process.env.JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    process.env.ADMIN_SECRET ||
    'rangisha-secure-jwt-hmac-secret-rwanda-2026'
  );
};

export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  iat: number;
  exp: number;
}

/**
 * Generates a signed HMAC-SHA256 JWT token for an authenticated administrator.
 * Valid for 24 hours.
 */
export function generateAdminToken(user: {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}): string {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url');

  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + 24 * 60 * 60 // 24 hours
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(`${header}.${payloadEncoded}`)
    .digest('base64url');

  return `${header}.${payloadEncoded}.${signature}`;
}

/**
 * Validates the signed admin token and checks expiration.
 * Returns decoded payload if valid, null otherwise.
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payloadEncoded, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', getSecretKey())
    .update(`${header}.${payloadEncoded}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadEncoded, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as AdminTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Express middleware to strictly enforce Admin authentication on protected routes.
 * Inspects Authorization header (Bearer <token>) or x-admin-token.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Uruhushya rwanze (Unauthorized): Admin authorization token required.'
    });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({
      error: 'Uruhushya rwataye agaciro (Unauthorized): Invalid or expired admin session token. Please log in again.'
    });
  }

  // Attach verified user payload to request
  (req as any).adminUser = payload;
  next();
}
