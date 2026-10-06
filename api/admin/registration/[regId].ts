import type { IncomingMessage, ServerResponse } from 'http';
import { registrationsStore } from '../../_storage';

interface VercelRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  end: (cb?: () => void) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const regIdParam = req.query?.regId;
  const regId = Array.isArray(regIdParam) ? regIdParam[0] : regIdParam;
  const targetId = String(regId || '').trim().toUpperCase();

  if (!targetId) {
    return res.status(400).json({ success: false, error: 'Registration ID required' });
  }

  const pIdx = registrationsStore.findIndex(r => r.registrationId.trim().toUpperCase() === targetId);
  if (pIdx >= 0) {
    registrationsStore.splice(pIdx, 1);
  }

  return res.status(200).json({
    success: true,
    message: `Registration ${targetId} removed.`
  });
}
