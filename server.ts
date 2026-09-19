import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface StoredRegistration {
  registrationId: string;
  submissionDate: string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected';
  leaderRoll: string;
  m1Roll: string;
  m2Roll: string;
  transactionId: string;
  editCount: number;
  maxEdits: number;
  lastEditedAt?: string;
  payload: any;
}

// In-memory persistent registry for duplicate detection and fallback storage
const registrationsStore: StoredRegistration[] = [];
let idSequence = 1;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support base64 participant images (up to 30mb)
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Textile Presentation Competition 2026 API',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/config', (req: Request, res: Response) => {
    const hasEnvScript = !!process.env.GOOGLE_SCRIPT_URL;
    res.json({
      hasGoogleScript: hasEnvScript,
      configuredUrl: hasEnvScript ? 'Configured via Environment Variable' : null
    });
  });

  // Diagnostic endpoint to test Google Apps Script connectivity
  app.post('/api/test-google-script', async (req: Request, res: Response) => {
    const { scriptUrl } = req.body;
    const targetUrl = scriptUrl || process.env.GOOGLE_SCRIPT_URL;

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'No Google Apps Script URL provided.'
      });
    }

    try {
      const getRes = await fetch(targetUrl, { redirect: 'follow' });
      const getText = await getRes.text();

      if (getText.includes('unable to open the file') || getText.includes('Page not found') || getRes.status === 404) {
        return res.json({
          success: false,
          error: 'Google error: "Unable to open the file at present". You need to authorize the script in Apps Script editor: select "setup" from the toolbar dropdown, click "▶ Run", and approve permissions.'
        });
      }

      let parsed: any = null;
      try {
        parsed = JSON.parse(getText);
      } catch (_) {}

      return res.json({
        success: true,
        message: 'Google Apps Script connected successfully!',
        scriptStatus: parsed?.status || 'ok'
      });
    } catch (e: any) {
      return res.status(500).json({
        success: false,
        error: e.message || 'Connection test failed.'
      });
    }
  });

  // Pre-check for duplicate roll numbers or transaction ID
  app.post('/api/validate-duplicates', (req: Request, res: Response) => {
    const { rolls, transactionId } = req.body;
    const cleanTrx = String(transactionId || '').trim().toUpperCase();
    const cleanRolls = Array.isArray(rolls) ? rolls.map((r: string) => String(r).trim()).filter(Boolean) : [];

    for (const reg of registrationsStore) {
      if (cleanTrx && reg.transactionId && reg.transactionId.toUpperCase() === cleanTrx) {
        return res.status(409).json({
          duplicate: true,
          field: 'transactionId',
          message: `Transaction ID "${cleanTrx}" has already been submitted with registration ${reg.registrationId}.`
        });
      }

      for (const roll of cleanRolls) {
        if ([reg.leaderRoll, reg.m1Roll, reg.m2Roll].includes(roll)) {
          return res.status(409).json({
            duplicate: true,
            field: 'roll',
            message: `Student Roll "${roll}" is already registered in team ${reg.registrationId}.`
          });
        }
      }
    }

    return res.json({ duplicate: false });
  });

  // Main Registration Endpoint
  app.post('/api/register', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const data = req.body;

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

      // 2. Validation
      if (!leader?.name || !leader?.roll || !leader?.whatsapp ||
          !member1?.name || !member1?.roll || !member1?.whatsapp ||
          !member2?.name || !member2?.roll || !member2?.whatsapp ||
          !payment?.transactionId || !payment?.bkashNumber) {
        console.warn('[REGISTRATION] Validation result: FAILED (Missing required participant or payment fields)');
        return res.status(400).json({
          success: false,
          error: 'Unable to submit registration',
          details: 'Missing required participant or payment fields.'
        });
      }

      const leaderRoll = String(leader.roll).trim();
      const m1Roll = String(member1.roll).trim();
      const m2Roll = String(member2.roll).trim();
      const transactionId = String(payment.transactionId).trim().toUpperCase();

      // Duplicate check against internal registry
      for (const reg of registrationsStore) {
        if (reg.transactionId === transactionId) {
          console.warn(`[REGISTRATION] Validation result: FAILED (Duplicate transaction ID "${transactionId}")`);
          return res.status(409).json({
            success: false,
            error: `Duplicate Transaction ID "${transactionId}". This payment was already used for team ${reg.registrationId}.`,
            details: 'Duplicate transaction ID detected.'
          });
        }
        if ([leaderRoll, m1Roll, m2Roll].some(r => [reg.leaderRoll, reg.m1Roll, reg.m2Roll].includes(r))) {
          console.warn('[REGISTRATION] Validation result: FAILED (Duplicate student roll)');
          return res.status(409).json({
            success: false,
            error: 'One or more student roll numbers are already registered with another team.',
            details: 'Duplicate roll number detected.'
          });
        }
      }

      console.log(`[REGISTRATION] Validation result: PASSED (Leader: ${leaderRoll}, Member 1: ${m1Roll}, Member 2: ${m2Roll}, Trx: ${transactionId})`);

      // Check if Google Apps Script Web App URL is configured
      const customScriptUrl = req.headers['x-google-script-url'] as string | undefined;
      const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzVPB_lyf20Tx7qNxgbNSSUxqi-9lQL4m-l6yD6QQMpgZSv3GSqk1o5qXDYhhInC3af_A/exec';

      if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
        try {
          console.log('[REGISTRATION] Connecting to Google Apps Script for Google Sheets & Google Drive...');
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
          } catch (e) {
            console.warn('[REGISTRATION] Google Sheets returned raw response:', rawText.slice(0, 200));
          }

          if (scriptData.status === 'error' || scriptData.success === false) {
            const errMsg = scriptData.message || scriptData.error || 'Unable to save registration to Google Sheets';
            const isDuplicate = errMsg.toLowerCase().includes('duplicate') || errMsg.toLowerCase().includes('already registered');
            
            if (isDuplicate) {
              return res.status(409).json({
                success: false,
                error: errMsg,
                details: scriptData.details || errMsg
              });
            }

            console.warn('[REGISTRATION] Google Sheets sync notice:', errMsg);
            // Fall back to server memory registry so user registration is not lost
          } else {
            const regId = scriptData.registrationId || `TEX2026-${String(idSequence++).padStart(3, '0')}`;
            const nowStr = scriptData.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

            console.log(`[REGISTRATION] Google Sheets sync result: SUCCESS, Drive photos uploaded: ${Boolean(scriptData.photos)}`);

            registrationsStore.push({
              registrationId: regId,
              submissionDate: nowStr,
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
              submissionDate: nowStr,
              paymentStatus: 'Pending',
              editCount: 0,
              maxEdits: 3,
              remainingEdits: 3,
              message: 'Registration and photos saved to Google Sheets & Drive successfully',
              source: 'google_sheets',
              photos: scriptData.photos
            });
          }
        } catch (fetchErr: any) {
          console.error('[REGISTRATION] Google Apps Script connection network error:', fetchErr.message);
          // Fall back to server memory registry
        }
      }

      // Generate sequence Registration ID (Fallback if script not configured)
      const regId = `TEX2026-${String(idSequence++).padStart(3, '0')}`;
      const now = new Date();
      const submissionDate = now.toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

      console.log(`[REGISTRATION] Registration ID generated: ${regId}`);
      console.log(`[REGISTRATION] Final response status: 200 OK`);

      registrationsStore.push({
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
        message: 'Registration submitted successfully',
        source: 'local'
      });

    } catch (err: any) {
      console.error('[REGISTRATION] Final response status: 500 ERROR:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to submit registration',
        details: err?.message || 'An unexpected internal error occurred during registration.'
      });
    }
  });

  // GET Registration by Registration No
  app.get('/api/registration/:regId', (req: Request, res: Response) => {
    const requestedId = String(req.params.regId || '').trim().toUpperCase();
    if (!requestedId) {
      return res.status(400).json({ success: false, error: 'Please provide a valid Registration Number.' });
    }

    const reg = registrationsStore.find(r => r.registrationId.trim().toUpperCase() === requestedId);
    if (!reg) {
      return res.status(404).json({
        success: false,
        error: `No registration record found for "${requestedId}". Please check the registration number and retry.`
      });
    }

    const editCount = reg.editCount ?? 0;
    const maxEdits = reg.maxEdits ?? 3;
    const remainingEdits = Math.max(0, maxEdits - editCount);

    return res.json({
      success: true,
      registration: {
        registrationId: reg.registrationId,
        submissionDate: reg.submissionDate,
        paymentStatus: reg.paymentStatus,
        editCount,
        maxEdits,
        remainingEdits,
        canEdit: remainingEdits > 0,
        lastEditedAt: reg.lastEditedAt,
        formData: reg.payload
      }
    });
  });

  // Client sync endpoint (restores local registration into memory cache if server restarted)
  app.post('/api/registration/sync', (req: Request, res: Response) => {
    const { registration } = req.body;
    if (!registration || !registration.registrationId) {
      return res.status(400).json({ success: false, error: 'Invalid registration payload.' });
    }

    const regId = String(registration.registrationId).trim().toUpperCase();
    const existingIndex = registrationsStore.findIndex(r => r.registrationId.trim().toUpperCase() === regId);

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
      // Don't overwrite if existing has higher editCount
      if (registrationsStore[existingIndex].editCount <= storedItem.editCount) {
        registrationsStore[existingIndex] = storedItem;
      }
    } else {
      registrationsStore.push(storedItem);
    }

    return res.json({ success: true });
  });

  // PUT / Edit Registration by Registration No (Max 3 edits allowed)
  app.put('/api/registration/:regId', async (req: Request, res: Response) => {
    try {
      const requestedId = String(req.params.regId || '').trim().toUpperCase();
      const updatedData = req.body?.formData;

      if (!requestedId || !updatedData) {
        return res.status(400).json({ success: false, error: 'Invalid update payload or missing registration number.' });
      }

      let reg = registrationsStore.find(r => r.registrationId.trim().toUpperCase() === requestedId);

      // If not found in server memory (e.g. server restarted), check if client passed backup
      if (!reg && req.body?.backupRegistration) {
        const backup = req.body.backupRegistration;
        reg = {
          registrationId: backup.registrationId || requestedId,
          submissionDate: backup.submissionDate || new Date().toISOString(),
          paymentStatus: backup.paymentStatus || 'Pending',
          leaderRoll: String(backup.formData?.leader?.roll || '').trim(),
          m1Roll: String(backup.formData?.member1?.roll || '').trim(),
          m2Roll: String(backup.formData?.member2?.roll || '').trim(),
          transactionId: String(backup.formData?.payment?.transactionId || '').trim().toUpperCase(),
          editCount: typeof backup.editCount === 'number' ? backup.editCount : 0,
          maxEdits: 3,
          lastEditedAt: backup.lastEditedAt,
          payload: backup.formData || updatedData
        };
        registrationsStore.push(reg);
      }

      if (!reg) {
        return res.status(404).json({
          success: false,
          error: `Registration "${requestedId}" not found. Unable to apply edit.`
        });
      }

      const currentEdits = reg.editCount ?? 0;
      if (currentEdits >= 3) {
        return res.status(403).json({
          success: false,
          error: `Maximum edit limit reached (3 of 3 edits used). Changes are locked for registration ${requestedId}. Please contact Career Club BTEC organizers if critical correction is needed.`
        });
      }

      // Check required fields
      const leader = updatedData.leader;
      const member1 = updatedData.member1;
      const member2 = updatedData.member2;
      if (!leader?.name || !leader?.roll || !leader?.whatsapp ||
          !member1?.name || !member1?.roll || !member1?.whatsapp ||
          !member2?.name || !member2?.roll || !member2?.whatsapp) {
        return res.status(400).json({ success: false, error: 'Please provide all required participant fields.' });
      }

      const newLeaderRoll = String(leader.roll).trim();
      const newM1Roll = String(member1.roll).trim();
      const newM2Roll = String(member2.roll).trim();

      // Ensure new rolls do not clash with OTHER registrations
      for (const other of registrationsStore) {
        if (other.registrationId.trim().toUpperCase() === requestedId) continue;
        if ([newLeaderRoll, newM1Roll, newM2Roll].some(r => [other.leaderRoll, other.m1Roll, other.m2Roll].includes(r))) {
          return res.status(409).json({
            success: false,
            error: 'One or more of the updated student roll numbers are already registered with another team.'
          });
        }
      }

      // Apply updates and increment editCount
      reg.payload = {
        ...reg.payload,
        ...updatedData,
        // Preserve payment if not explicitly altered
        payment: {
          ...reg.payload.payment,
          ...(updatedData.payment || {})
        }
      };
      reg.leaderRoll = newLeaderRoll;
      reg.m1Roll = newM1Roll;
      reg.m2Roll = newM2Roll;
      reg.editCount = currentEdits + 1;
      reg.lastEditedAt = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

      const remaining = Math.max(0, 3 - reg.editCount);

      return res.json({
        success: true,
        message: `Registration updated successfully. You have ${remaining} of 3 edits remaining.`,
        registration: {
          registrationId: reg.registrationId,
          submissionDate: reg.submissionDate,
          paymentStatus: reg.paymentStatus,
          editCount: reg.editCount,
          maxEdits: 3,
          remainingEdits: remaining,
          canEdit: remaining > 0,
          lastEditedAt: reg.lastEditedAt,
          formData: reg.payload
        }
      });
    } catch (e: any) {
      console.error('Failed to update registration:', e);
      return res.status(500).json({
        success: false,
        error: e.message || 'An unexpected error occurred while saving edits.'
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Textile Presentation Competition 2026 server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
