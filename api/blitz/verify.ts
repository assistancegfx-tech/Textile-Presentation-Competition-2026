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

const globalStore = globalThis as unknown as {
  __blitz_registrations?: any[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-google-script-url');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  const rawRegId = String(body?.registrationId || body?.regId || '').trim();
  const rawStudentId = String(body?.studentId || '').trim();

  if (!rawRegId || !rawStudentId) {
    return res.status(400).json({
      success: false,
      error: 'Both Registration No and Student ID are required for verification.'
    });
  }

  let cleanRegId = rawRegId.toUpperCase();
  if (!cleanRegId.startsWith('TBW-') && /^\d+$/.test(cleanRegId)) {
    cleanRegId = `TBW-${cleanRegId}`;
  }

  const cleanStudentId = rawStudentId.toUpperCase();
  const studentDigits = rawStudentId.replace(/\D/g, '');

  const store = globalStore.__blitz_registrations || [];
  let found = store.find((b: any) => b.registrationId && b.registrationId.toUpperCase() === cleanRegId);

  // Query Google Apps Script tab
  const customScriptUrl = (req.headers['x-google-script-url'] as string | undefined) || req.query?.scriptUrl as string;
  const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL;

  if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
    try {
      const queryUrl = `${targetScriptUrl}${targetScriptUrl.includes('?') ? '&' : '?'}action=get_blitz&query=${encodeURIComponent(cleanRegId)}`;
      const gRes = await fetch(queryUrl, { signal: AbortSignal.timeout(6000), redirect: 'follow' });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData && gData.success && gData.registration) {
          const sheetRec = gData.registration;
          if (found) {
            found.paymentStatus = sheetRec.paymentStatus || found.paymentStatus;
          } else {
            found = {
              registrationId: sheetRec.registrationId,
              submissionDate: sheetRec.submissionDate,
              paymentStatus: sheetRec.paymentStatus || 'Pending',
              fullName: sheetRec.fullName,
              batch: sheetRec.batch,
              department: sheetRec.department,
              studentId: sheetRec.studentId,
              whatsapp: sheetRec.whatsapp,
              email: sheetRec.email || '',
              senderBkash: sheetRec.senderBkash,
              transactionId: sheetRec.transactionId,
              editCount: sheetRec.editCount || 0,
              maxEdits: 3,
              payload: sheetRec
            };
            store.push(found);
          }
        }
      }
    } catch (err: any) {
      console.warn('[VERCEL BLITZ VERIFY] Google Sheet sync check notice:', err.message);
    }
  }

  if (!found) {
    return res.status(404).json({
      success: false,
      error: `No Blitz Writing record found for Registration No "${cleanRegId}". Please verify your Registration No.`
    });
  }

  const storedStudent = String(found.studentId || '').trim().toUpperCase();
  const storedClean = storedStudent.replace(/[\s\-_]/g, '');
  const inputClean = cleanStudentId.replace(/[\s\-_]/g, '');
  const storedDigits = storedStudent.replace(/\D/g, '');
  const isStudentMatch = storedStudent === cleanStudentId || 
                         (inputClean.length >= 2 && storedClean === inputClean) ||
                         (studentDigits.length >= 2 && storedDigits === studentDigits) ||
                         (studentDigits.length >= 4 && storedDigits.endsWith(studentDigits));

  if (!isStudentMatch) {
    return res.status(403).json({
      success: false,
      error: `Student ID "${rawStudentId}" does not match the record for Registration No "${cleanRegId}".`
    });
  }

  return res.json({
    success: true,
    verified: true,
    registration: {
      registrationId: found.registrationId,
      submissionDate: found.submissionDate,
      paymentStatus: found.paymentStatus,
      editCount: found.editCount || 0,
      maxEdits: found.maxEdits || 3,
      remainingEdits: Math.max(0, (found.maxEdits || 3) - (found.editCount || 0)),
      formData: {
        fullName: found.fullName,
        batch: found.batch,
        department: found.department,
        studentId: found.studentId,
        whatsapp: found.whatsapp,
        email: found.email,
        senderBkash: found.senderBkash,
        transactionId: found.transactionId
      }
    }
  });
}
