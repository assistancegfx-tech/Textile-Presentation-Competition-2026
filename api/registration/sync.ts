import type { IncomingMessage, ServerResponse } from 'http';
import { registrationsStore, StoredRegistration } from '../_storage';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { registration } = body || {};
  if (!registration || !registration.registrationId) {
    return res.status(400).json({ success: false, error: 'Invalid registration payload.' });
  }

  const regId = String(registration.registrationId).trim().toUpperCase();
  const existingIndex = registrationsStore.findIndex(r => r.registrationId.toUpperCase() === regId);

  const storedItem: StoredRegistration = {
    registrationId: registration.registrationId,
    submissionDate: registration.submissionDate || new Date().toISOString(),
    paymentStatus: registration.paymentStatus || 'Pending',
    leaderRoll: String(registration.formData?.leader?.roll || '').trim(),
    m1Roll: String(registration.formData?.member1?.roll || '').trim(),
    m2Roll: String(registration.formData?.member2?.roll || '').trim(),
    transactionId: String(registration.formData?.payment?.transactionId || '').trim().toUpperCase(),
    editCount: typeof registration.editCount === 'number' ? registration.editCount : 0,
    maxEdits: 3,
    lastEditedAt: registration.lastEditedAt,
    payload: registration.formData
  };

  if (existingIndex >= 0) {
    if (registrationsStore[existingIndex].editCount <= storedItem.editCount) {
      registrationsStore[existingIndex] = storedItem;
    }
  } else {
    registrationsStore.push(storedItem);
  }

  return res.status(200).json({ success: true });
}
