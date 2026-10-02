import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  end: (cb?: () => void) => this;
}

const globalStore = globalThis as unknown as {
  __tpc_adminPassword?: string;
  __tpc_adminTokens?: Set<string>;
};

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

  // Parse body if stream
  let body = req.body;
  if (!body) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      body = JSON.parse(Buffer.concat(buffers).toString());
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

  const currentPassword = String(body?.currentPassword || '').trim();
  const newPassword = String(body?.newPassword || '').trim();
  const currentExpected = globalStore.__tpc_adminPassword || process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'admin123';

  if (currentPassword !== currentExpected) {
    return res.status(400).json({ success: false, error: 'Current admin password is incorrect.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
  }

  globalStore.__tpc_adminPassword = newPassword;

  return res.status(200).json({
    success: true,
    message: 'Admin password updated successfully! Please keep your new password safe.'
  });
}
