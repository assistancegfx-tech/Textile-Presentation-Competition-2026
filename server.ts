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
    try {
      const data = req.body;
      const customScriptUrl = req.headers['x-google-script-url'] as string | undefined;
      const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL;

      // Basic backend sanity validation
      const leader = data?.leader;
      const member1 = data?.member1;
      const member2 = data?.member2;
      const payment = data?.payment;

      if (!leader?.name || !leader?.roll || !leader?.whatsapp ||
          !member1?.name || !member1?.roll || !member1?.whatsapp ||
          !member2?.name || !member2?.roll || !member2?.whatsapp ||
          !payment?.transactionId || !payment?.bkashNumber) {
        return res.status(400).json({
          success: false,
          error: 'Missing required registration or payment fields.'
        });
      }

      const leaderRoll = String(leader.roll).trim();
      const m1Roll = String(member1.roll).trim();
      const m2Roll = String(member2.roll).trim();
      const transactionId = String(payment.transactionId).trim().toUpperCase();

      // Duplicate check against internal registry
      for (const reg of registrationsStore) {
        if (reg.transactionId === transactionId) {
          return res.status(409).json({
            success: false,
            error: `Duplicate Transaction ID "${transactionId}". This payment was already used for team ${reg.registrationId}.`
          });
        }
        if ([leaderRoll, m1Roll, m2Roll].some(r => [reg.leaderRoll, reg.m1Roll, reg.m2Roll].includes(r))) {
          return res.status(409).json({
            success: false,
            error: 'One or more student roll numbers are already registered with another team.'
          });
        }
      }

      // If Google Apps Script Web App URL is configured, forward to Google Sheets & Drive
      if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
        try {
          // Google Apps Script redirect handling: fetch follows redirect automatically
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
            console.error('Non-JSON response from Google Apps Script:', rawText.slice(0, 300));
            if (rawText.includes('unable to open the file') || rawText.includes('Page not found') || scriptResponse.status === 404) {
              return res.status(502).json({
                success: false,
                error: 'Google Apps Script needs authorization ("Unable to open the file at present"). Please open the Apps Script editor, select "setup" from the function dropdown at top, click "▶ Run", and approve permissions. Then redeploy as a New version.'
              });
            }
            return res.status(502).json({
              success: false,
              error: 'Google Apps Script Web App returned an invalid response. Please ensure your script is deployed as "Execute as: Me" and "Who has access: Anyone".'
            });
          }

          if (scriptData.status === 'error') {
            return res.status(400).json({
              success: false,
              error: scriptData.message || 'Error occurred while saving to Google Sheets.'
            });
          }

          const regId = scriptData.registrationId || `TEX2026-${String(idSequence++).padStart(3, '0')}`;
          const nowStr = scriptData.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

          registrationsStore.push({
            registrationId: regId,
            submissionDate: nowStr,
            paymentStatus: 'Pending',
            leaderRoll,
            m1Roll,
            m2Roll,
            transactionId,
            payload: data
          });

          return res.json({
            success: true,
            registrationId: regId,
            submissionDate: nowStr,
            paymentStatus: 'Pending',
            message: 'Registration submitted successfully. Your registration is pending verification.',
            source: 'google_sheets',
            photos: scriptData.photos
          });
        } catch (fetchErr: any) {
          console.error('Failed to communicate with Google Apps Script:', fetchErr);
          return res.status(503).json({
            success: false,
            error: `Failed to connect to Google Sheets backend: ${fetchErr.message || 'Network error'}. Please check your connection and retry.`
          });
        }
      }

      // Fallback mode (when script URL is not yet connected by organizer)
      // Generates unique Registration ID, records data securely, informs the user
      const regId = `TEX2026-${String(idSequence++).padStart(3, '0')}`;
      const now = new Date();
      const submissionDate = now.toISOString().replace('T', ' ').substring(0, 19);

      registrationsStore.push({
        registrationId: regId,
        submissionDate,
        paymentStatus: 'Pending',
        leaderRoll,
        m1Roll,
        m2Roll,
        transactionId,
        payload: data
      });

      return res.json({
        success: true,
        registrationId: regId,
        submissionDate,
        paymentStatus: 'Pending',
        message: 'Registration submitted successfully. Your registration is pending verification.',
        source: 'local_fallback',
        warning: 'Google Apps Script URL is not configured yet. Record stored in application registry.'
      });

    } catch (err: any) {
      console.error('Server registration error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'An unexpected internal error occurred during registration.'
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
