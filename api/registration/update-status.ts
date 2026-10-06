import type { IncomingMessage, ServerResponse } from 'http';
import { registrationsStore } from '../_storage';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  end: (cb?: () => void) => this;
}

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (!body && typeof req.on === 'function') {
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

  const { registrationId, paymentStatus, status } = body || {};
  const cleanId = String(registrationId || '').trim().toUpperCase();
  const newStatus = String(paymentStatus || status || 'Approved').trim();

  if (!cleanId) {
    return res.status(400).json({ success: false, error: 'Registration ID required.' });
  }

  const reg = registrationsStore.find(r => r.registrationId.trim().toUpperCase() === cleanId);
  if (reg) {
    reg.paymentStatus = newStatus as any;
  }

  const targetScriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL;
  let sheetUpdated = false;

  if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
    try {
      const scriptRes = await fetch(targetScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateStatus',
          registrationId: cleanId,
          paymentStatus: newStatus
        }),
        redirect: 'follow'
      });
      const scriptJson: any = await scriptRes.json();
      if (scriptJson && scriptJson.success) {
        sheetUpdated = true;
      }
    } catch (err: any) {
      console.warn('Google Sheet updateStatus notice:', err.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: `Status updated to ${newStatus}.`,
    sheetUpdated
  });
}
