import type { IncomingMessage, ServerResponse } from 'http';
import {
  getNextRegistrationId,
  findDuplicateTransaction,
  findDuplicateRoll,
  saveRegistration
} from './_storage';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Content-Type headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Support POST only
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      details: 'Only POST requests are supported on this endpoint.'
    });
  }

  try {
    // Parse JSON body if received as string or buffer
    let data = req.body;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload received',
          details: 'Unable to parse request body as JSON.'
        });
      }
    } else if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Missing request body',
        details: 'Request body cannot be empty.'
      });
    }

    const leader = data?.leader;
    const member1 = data?.member1;
    const member2 = data?.member2;
    const payment = data?.payment;

    // Validation: check required fields
    if (
      !leader?.name || !leader?.roll || !leader?.whatsapp ||
      !member1?.name || !member1?.roll || !member1?.whatsapp ||
      !member2?.name || !member2?.roll || !member2?.whatsapp ||
      !payment?.transactionId || !payment?.bkashNumber
    ) {
      return res.status(400).json({
        success: false,
        error: 'Unable to submit registration',
        details: 'Missing required participant or payment information. All 3 members and payment verification are mandatory.'
      });
    }

    const leaderRoll = String(leader.roll).trim();
    const m1Roll = String(member1.roll).trim();
    const m2Roll = String(member2.roll).trim();
    const transactionId = String(payment.transactionId).trim().toUpperCase();

    // Check duplicate roll numbers
    const dupRoll = findDuplicateRoll([leaderRoll, m1Roll, m2Roll]);
    if (dupRoll) {
      return res.status(409).json({
        success: false,
        error: `Student roll "${dupRoll.roll}" is already registered with team ${dupRoll.record.registrationId}.`,
        details: 'Duplicate roll number detected in database.'
      });
    }

    // Check duplicate transaction ID
    const dupTrx = findDuplicateTransaction(transactionId);
    if (dupTrx) {
      return res.status(409).json({
        success: false,
        error: `Transaction ID "${transactionId}" was already used for team ${dupTrx.registrationId}.`,
        details: 'Duplicate payment transaction detected.'
      });
    }

    // Generate standard Registration ID
    const regId = getNextRegistrationId();
    const submissionDate = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

    // Store registration in server memory
    saveRegistration({
      registrationId: regId,
      submissionDate,
      paymentStatus: 'Pending',
      leaderRoll,
      m1Roll,
      m2Roll,
      transactionId,
      editCount: 0,
      maxEdits: 3,
      payload: data
    });

    return res.status(200).json({
      success: true,
      registrationId: regId,
      submissionDate,
      paymentStatus: 'Pending',
      editCount: 0,
      maxEdits: 3,
      remainingEdits: 3,
      message: 'Registration submitted successfully'
    });

  } catch (err: any) {
    console.error('[REGISTRATION] Serverless function error:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to submit registration',
      details: err?.message || 'An unexpected internal error occurred during registration.'
    });
  }
}
