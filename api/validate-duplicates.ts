import type { IncomingMessage, ServerResponse } from 'http';
import { findDuplicateRoll, findDuplicateTransaction } from './_storage';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { rolls, transactionId } = body || {};
    const cleanTrx = String(transactionId || '').trim().toUpperCase();
    const cleanRolls = Array.isArray(rolls) ? rolls.map((r: string) => String(r).trim()).filter(Boolean) : [];

    if (cleanTrx) {
      const dupTrx = findDuplicateTransaction(cleanTrx);
      if (dupTrx) {
        return res.status(409).json({
          duplicate: true,
          field: 'transactionId',
          message: `Transaction ID "${cleanTrx}" has already been submitted with registration ${dupTrx.registrationId}.`
        });
      }
    }

    if (cleanRolls.length > 0) {
      const dupRoll = findDuplicateRoll(cleanRolls);
      if (dupRoll) {
        return res.status(409).json({
          duplicate: true,
          field: 'roll',
          message: `Student Roll "${dupRoll.roll}" is already registered in team ${dupRoll.record.registrationId}.`
        });
      }
    }

    return res.status(200).json({ duplicate: false });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Duplicate validation error',
      details: err?.message
    });
  }
}
