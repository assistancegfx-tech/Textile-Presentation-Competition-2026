import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  end: (cb?: () => void) => this;
}

// Global store across warm invocations
const globalStore = globalThis as unknown as {
  __tpc_adminPassword?: string;
  __tpc_failedAttempts?: Map<string, { count: number; lockedUntil: number }>;
  __tpc_adminTokens?: Set<string>;
};

if (!globalStore.__tpc_failedAttempts) {
  globalStore.__tpc_failedAttempts = new Map();
}
if (!globalStore.__tpc_adminTokens) {
  globalStore.__tpc_adminTokens = new Set();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Parse body if received as stream
  let body = req.body;
  if (!body) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString();
      body = JSON.parse(raw);
    } catch {
      body = {};
    }
  } else if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const failedAttempts = globalStore.__tpc_failedAttempts!;
  const attemptInfo = failedAttempts.get(clientIp) || { count: 0, lockedUntil: 0 };

  if (attemptInfo.lockedUntil > now) {
    const remainingMins = Math.ceil((attemptInfo.lockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      error: `Security Alert: Too many failed login attempts. Temporarily locked for ${remainingMins} minute(s).`
    });
  }

  const expectedPassword = globalStore.__tpc_adminPassword || process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'Whatthefuck1';
  const inputPwd = String(body?.password || '').trim();

  if (inputPwd && inputPwd === expectedPassword) {
    failedAttempts.delete(clientIp);
    const token = 'tpc_sec_' + crypto.randomBytes(24).toString('hex');
    globalStore.__tpc_adminTokens!.add(token);

    return res.status(200).json({
      success: true,
      message: 'Admin access granted.',
      token,
      isDefaultPassword: false
    });
  }

  attemptInfo.count += 1;
  if (attemptInfo.count >= 5) {
    attemptInfo.lockedUntil = now + 10 * 60 * 1000;
    failedAttempts.set(clientIp, attemptInfo);
    return res.status(429).json({
      success: false,
      error: 'Security Alert: 5 incorrect password attempts. Access temporarily locked for 10 minutes.'
    });
  }

  failedAttempts.set(clientIp, attemptInfo);
  const remaining = 5 - attemptInfo.count;
  return res.status(401).json({
    success: false,
    error: `Invalid Admin Password. ${remaining} attempt(s) remaining before temporary lockout.`
  });
}
