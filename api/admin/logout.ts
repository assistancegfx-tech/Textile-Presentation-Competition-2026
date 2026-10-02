import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  end: (cb?: () => void) => this;
}

const globalStore = globalThis as unknown as {
  __tpc_adminTokens?: Set<string>;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = (req.headers['authorization'] as string) || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (token && globalStore.__tpc_adminTokens) {
    globalStore.__tpc_adminTokens.delete(token);
  }

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
