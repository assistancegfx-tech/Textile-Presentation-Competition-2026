import type { IncomingMessage, ServerResponse } from 'http';
import {
  registrationsStore,
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always guarantee JSON response
  res.setHeader('Content-Type', 'application/json');

  // Support POST only
  if (req.method !== 'POST') {
    console.warn(`[REGISTRATION] Method ${req.method} rejected. Only POST is allowed.`);
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
      } catch (parseErr) {
        console.error('[REGISTRATION] Invalid JSON body payload received.');
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON payload received',
          details: 'Unable to parse request body as JSON.'
        });
      }
    }

    const leader = data?.leader;
    const member1 = data?.member1;
    const member2 = data?.member2;
    const payment = data?.payment;

    // 1. Log: Request received
    console.log('[REGISTRATION] Request received:', {
      leaderName: leader?.name || 'Unknown',
      leaderRoll: leader?.roll || 'Unknown',
      teamSize: 3,
      hasPhotos: Boolean(leader?.photoBase64 && member1?.photoBase64 && member2?.photoBase64),
      transactionId: payment?.transactionId ? `${payment.transactionId.substring(0, 4)}***` : 'None',
      timestamp: new Date().toISOString()
    });

    // 2. Validation: check required fields
    if (
      !leader?.name || !leader?.roll || !leader?.whatsapp ||
      !member1?.name || !member1?.roll || !member1?.whatsapp ||
      !member2?.name || !member2?.roll || !member2?.whatsapp ||
      !payment?.transactionId || !payment?.bkashNumber
    ) {
      console.warn('[REGISTRATION] Validation result: FAILED (Missing required fields)');
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
      console.warn(`[REGISTRATION] Validation result: FAILED (Student roll ${dupRoll.roll} already registered)`);
      return res.status(409).json({
        success: false,
        error: `Student roll "${dupRoll.roll}" is already registered with team ${dupRoll.record.registrationId}.`,
        details: 'Duplicate roll number detected in database.'
      });
    }

    // Check duplicate transaction ID
    const dupTrx = findDuplicateTransaction(transactionId);
    if (dupTrx) {
      console.warn(`[REGISTRATION] Validation result: FAILED (Transaction ID ${transactionId} already used)`);
      return res.status(409).json({
        success: false,
        error: `Transaction ID "${transactionId}" was already used for team ${dupTrx.registrationId}.`,
        details: 'Duplicate payment transaction detected.'
      });
    }

    console.log(`[REGISTRATION] Validation result: PASSED (Leader: ${leaderRoll}, Member 1: ${m1Roll}, Member 2: ${m2Roll}, Trx: ${transactionId})`);

    // Determine Google Apps Script target URL (from custom header or environment variable)
    const customScriptUrl = req.headers['x-google-script-url'] as string | undefined;
    const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL;

    // Forward to Google Apps Script (Google Sheets & Google Drive) if configured
    if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        console.log('[REGISTRATION] Connecting to Google Apps Script Web App for Google Sheets & Google Drive processing...');
        const scriptResponse = await fetch(targetScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data),
          redirect: 'follow'
        });

        const rawText = await scriptResponse.text();
        let scriptData: any = {};
        try {
          scriptData = JSON.parse(rawText);
        } catch (scriptParseErr) {
          console.error('[REGISTRATION] Google Sheets connection result: FAILED (Google Apps Script returned non-JSON):', rawText.slice(0, 250));
          return res.status(502).json({
            success: false,
            error: 'Google Apps Script returned an invalid response',
            details: 'The Google Apps Script Web App returned plain text/HTML instead of JSON. Ensure your script is deployed as "Execute as: Me" and "Who has access: Anyone".'
          });
        }

        // Check if script reported an error
        if (scriptData.status === 'error' || scriptData.success === false) {
          console.warn('[REGISTRATION] Google Sheets connection result: ERROR from script:', scriptData.message || scriptData.error);
          if (
            scriptData.error === 'Photo upload failed' ||
            (scriptData.message && scriptData.message.toLowerCase().includes('photo'))
          ) {
            console.error('[REGISTRATION] Google Drive upload result: FAILED');
            return res.status(400).json({
              success: false,
              error: 'Photo upload failed',
              details: scriptData.details || scriptData.message || 'Failed to process photos in Google Drive.'
            });
          }

          return res.status(400).json({
            success: false,
            error: scriptData.error || scriptData.message || 'Unable to submit registration',
            details: scriptData.details || scriptData.message
          });
        }

        const regId = scriptData.registrationId || getNextRegistrationId();
        const submissionDate = scriptData.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

        // 3. Log: Google Sheets connection result
        console.log(`[REGISTRATION] Google Sheets connection result: SUCCESS (Row added to sheet)`);

        // 4. Log: Google Drive upload result
        const photosOk = Boolean(scriptData.photos?.leader || scriptData.photos?.member1 || scriptData.photos?.member2);
        console.log(`[REGISTRATION] Google Drive upload result: ${photosOk ? 'SUCCESS (Participant photos saved in Drive)' : 'COMPLETED'}`);

        // 5. Log: Registration ID
        console.log(`[REGISTRATION] Registration ID: ${regId}`);

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

        // 6. Log: Final response status
        console.log(`[REGISTRATION] Final response status: 200 OK`);

        return res.status(200).json({
          success: true,
          registrationId: regId,
          submissionDate,
          paymentStatus: 'Pending',
          editCount: 0,
          maxEdits: 3,
          remainingEdits: 3,
          message: 'Registration submitted successfully',
          source: 'google_sheets',
          photos: scriptData.photos
        });

      } catch (fetchErr: any) {
        console.error('[REGISTRATION] Google Sheets connection result: NETWORK ERROR:', fetchErr.message);
        return res.status(503).json({
          success: false,
          error: 'Unable to connect to Google Sheets backend',
          details: fetchErr.message || 'Network error communicating with Google Apps Script'
        });
      }
    }

    // Default Fallback flow (stores record safely when Google Apps Script is not configured)
    const regId = getNextRegistrationId();
    const submissionDate = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

    console.log('[REGISTRATION] Google Sheets connection result: Fallback mode active (record saved in application registry)');
    console.log('[REGISTRATION] Google Drive upload result: Participant photos processed (stored in local registry payload)');
    console.log(`[REGISTRATION] Registration ID: ${regId}`);

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

    console.log(`[REGISTRATION] Final response status: 200 OK`);

    return res.status(200).json({
      success: true,
      registrationId: regId,
      submissionDate,
      paymentStatus: 'Pending',
      editCount: 0,
      maxEdits: 3,
      remainingEdits: 3,
      message: 'Registration submitted successfully',
      source: 'local_fallback',
      warning: 'Google Apps Script URL not configured. Stored in application registry.'
    });

  } catch (err: any) {
    console.error('[REGISTRATION] Final response status: 500 Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to submit registration',
      details: err?.message || 'An unexpected internal error occurred during registration.'
    });
  }
}
