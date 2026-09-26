import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (body: any) => void;
  end: (cb?: () => void) => this;
}

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

// Global blitz store in memory for warm serverless instances
const globalStore = globalThis as unknown as {
  __blitz_registrations?: any[];
  __blitz_seq?: number;
};

if (!globalStore.__blitz_registrations) {
  globalStore.__blitz_registrations = [];
}
if (!globalStore.__blitz_seq) {
  globalStore.__blitz_seq = 1;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Content-Type headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-google-script-url');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      details: 'Only POST requests are supported on this endpoint.'
    });
  }

  try {
    let data = req.body;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload received.'
        });
      }
    } else if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Missing request body.'
      });
    }

    const fullName = String(data.fullName || '').trim();
    const batch = String(data.batch || '').trim();
    const department = String(data.department || '').trim();
    const studentId = String(data.studentId || '').trim();
    const whatsapp = String(data.whatsapp || '').trim();
    const email = String(data.email || '').trim();
    const senderBkash = String(data.senderBkash || '').trim();
    const transactionId = String(data.transactionId || '').trim().toUpperCase();

    if (!fullName || !batch || !department || !studentId || !whatsapp || !senderBkash || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please ensure Full Name, Batch, Department, Student ID, WhatsApp, Sender bKash, and TrxID are filled.'
      });
    }

    const now = new Date();
    const submissionDate = now.toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

    // Generate Blitz Registration ID: TBW-{idCode}-{seq}
    const digits = studentId.replace(/\D/g, '');
    const idCode = digits.length >= 2 ? digits.slice(-2) : (batch || '26').padStart(2, '0');
    
    let maxBlitzSeq = 0;
    const store = globalStore.__blitz_registrations || [];
    for (const b of store) {
      const match = String(b.registrationId || '').match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxBlitzSeq) maxBlitzSeq = num;
      }
    }
    const nextSeq = Math.max(globalStore.__blitz_seq || 1, maxBlitzSeq + 1);
    globalStore.__blitz_seq = nextSeq + 1;
    const seqStr = String(nextSeq).padStart(2, '0');
    const regId = `TBW-${idCode}-${seqStr}`;

    const customScriptUrl = (req.headers['x-google-script-url'] as string | undefined) || data?.scriptUrl;
    const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL;

    let googleSynced = false;
    let emailSent = Boolean(email);

    if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        const scriptPayload = {
          action: 'blitz_registration',
          registrationType: 'blitz',
          registrationId: regId,
          submissionDate,
          fullName,
          batch,
          department,
          studentId,
          whatsapp,
          email,
          senderBkash,
          transactionId,
          pdfBase64: data.pdfBase64
        };

        const scriptRes = await fetch(targetScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            'Accept': 'application/json, text/plain, */*'
          },
          body: JSON.stringify(scriptPayload),
          signal: AbortSignal.timeout(10000)
        });

        const rawText = await scriptRes.text();
        let scriptData: any = {};
        try {
          scriptData = JSON.parse(rawText);
        } catch (_) {}

        if (scriptData.status !== 'error' && scriptData.success !== false) {
          googleSynced = true;
          if (scriptData.emailSent !== undefined) {
            emailSent = Boolean(scriptData.emailSent);
          }
        }
      } catch (err: any) {
        console.warn('[BLITZ VERCEL] Google Sheet sync notice:', err.message);
      }
    }

    const newRecord = {
      registrationId: regId,
      submissionDate,
      paymentStatus: 'Pending',
      fullName,
      batch,
      department,
      studentId,
      whatsapp,
      email,
      senderBkash,
      transactionId,
      editCount: 0,
      maxEdits: 3,
      payload: data
    };
    store.push(newRecord);

    return res.status(200).json({
      success: true,
      registrationId: regId,
      submissionDate,
      fullName,
      batch,
      department,
      studentId,
      whatsapp,
      email,
      senderBkash,
      transactionId,
      paymentStatus: 'Pending',
      editCount: 0,
      maxEdits: 3,
      remainingEdits: 3,
      emailSent,
      emailRecipient: email,
      message: 'Textile Blitz Writing registration recorded successfully.',
      source: googleSynced ? 'google_sheets' : 'local'
    });
  } catch (err: any) {
    console.error('[BLITZ VERCEL] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing Blitz Writing registration.'
    });
  }
}
