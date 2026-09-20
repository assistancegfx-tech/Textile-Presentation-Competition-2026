import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface StoredRegistration {
  registrationId: string;
  submissionDate: string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected';
  teamName?: string;
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

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    }
  } catch (_) {}
}
loadEnvFile();

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

  // Serve latest Google Apps Script code
  app.get('/api/script-code', (req: Request, res: Response) => {
    try {
      const scriptPath = path.join(process.cwd(), 'google-apps-script.js');
      if (fs.existsSync(scriptPath)) {
        const code = fs.readFileSync(scriptPath, 'utf-8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(code);
      }
      return res.status(404).send('// google-apps-script.js not found');
    } catch (e: any) {
      return res.status(500).send('// Error reading script: ' + e.message);
    }
  });

  let configuredGoogleScriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL;

  const getActiveScriptUrl = (req?: Request): string => {
    const customHeader = req?.headers['x-google-script-url'] as string | undefined;
    const customQuery = req?.query?.scriptUrl as string | undefined;
    return customHeader || customQuery || configuredGoogleScriptUrl;
  };

  app.get('/api/config', (req: Request, res: Response) => {
    res.json({
      hasGoogleScript: !!configuredGoogleScriptUrl,
      configuredUrl: configuredGoogleScriptUrl
    });
  });

  // Google Apps Script URL configuration endpoints
  app.get('/api/config/script-url', (_req: Request, res: Response) => {
    res.json({ success: true, scriptUrl: configuredGoogleScriptUrl });
  });

  app.post('/api/config/script-url', (req: Request, res: Response) => {
    const { scriptUrl } = req.body;
    if (scriptUrl && typeof scriptUrl === 'string' && scriptUrl.startsWith('http')) {
      configuredGoogleScriptUrl = scriptUrl.trim();
      console.log(`[CONFIG] Google Script URL updated to: ${configuredGoogleScriptUrl}`);
    }
    res.json({ success: true, scriptUrl: configuredGoogleScriptUrl });
  });

  // Test connection to Google Apps Script & Google Sheet
  app.post('/api/test-google-sheet', async (req: Request, res: Response) => {
    const { scriptUrl } = req.body;
    const targetUrl = (scriptUrl || configuredGoogleScriptUrl).trim();

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'No valid Google Apps Script Web App URL provided.'
      });
    }

    try {
      const queryUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const getRes = await fetch(queryUrl, { signal: controller.signal, redirect: 'follow' });
      clearTimeout(timeoutId);
      const getText = await getRes.text();

      if (getText.includes('unable to open the file') || getText.includes('Page not found') || getRes.status === 404) {
        return res.json({
          success: false,
          error: 'Google error: "Unable to open the file at present". In Apps Script editor: select "setup" from the dropdown, click "▶ Run", and authorize permissions.'
        });
      }

      let parsed: any = null;
      try {
        parsed = JSON.parse(getText);
      } catch (_) {}

      if (parsed && (parsed.status === 'ok' || parsed.success)) {
        return res.json({
          success: true,
          message: 'Google Sheet connected successfully!',
          sheetName: parsed.sheetName || 'Registrations',
          totalRows: parsed.totalRows
        });
      }

      return res.json({
        success: true,
        message: 'Google Apps Script connected!',
        scriptStatus: parsed?.status || 'ok'
      });
    } catch (e: any) {
      return res.status(500).json({
        success: false,
        error: e.message || 'Connection test failed.'
      });
    }
  });

  // Diagnostic endpoint to test Google Apps Script connectivity
  app.post('/api/test-google-script', async (req: Request, res: Response) => {
    const { scriptUrl } = req.body;
    const targetUrl = scriptUrl || configuredGoogleScriptUrl;

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

      const teamName = String(data?.teamName || '').trim();

      console.log(`[REGISTRATION] Validation result: PASSED (Team: "${teamName}", Leader: ${leaderRoll}, Member 1: ${m1Roll}, Member 2: ${m2Roll}, Trx: ${transactionId})`);

      // Check if Google Apps Script Web App URL is configured
      const customScriptUrl = req.headers['x-google-script-url'] as string | undefined;
      const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

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
              teamName: teamName || scriptData.teamName || '',
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
              teamName: teamName || scriptData.teamName || '',
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
        teamName,
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
        teamName,
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

  // GET Registration by Registration No (with live Google Sheets status synchronization)
  app.get('/api/registration/:regId', async (req: Request, res: Response) => {
    const requestedId = String(req.params.regId || '').trim().toUpperCase();
    if (!requestedId) {
      return res.status(400).json({ success: false, error: 'Please provide a valid Registration Number.' });
    }

    let reg = registrationsStore.find(r => r.registrationId.trim().toUpperCase() === requestedId);

    // If Google Apps Script is configured, fetch live status from Google Sheets
    const customScriptUrl = req.headers['x-google-script-url'] as string | undefined;
    const targetScriptUrl = customScriptUrl || req.query.scriptUrl as string || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

    if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        const queryUrl = `${targetScriptUrl}${targetScriptUrl.includes('?') ? '&' : '?'}action=get&regId=${encodeURIComponent(requestedId)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const gRes = await fetch(queryUrl, { signal: controller.signal, redirect: 'follow' });
        clearTimeout(timeoutId);
        
        if (gRes.ok) {
          const gData: any = await gRes.json();
          if (gData && (gData.success || gData.found) && gData.registrationId) {
            const liveStatus = gData.paymentStatus || 'Pending';
            
            const formatBdPhone = (phone: any): string => {
              if (!phone) return '';
              let str = String(phone).trim().replace(/[\s\-()]/g, '');
              if (str.startsWith('+880')) str = str.slice(4);
              else if (str.startsWith('880')) str = str.slice(3);
              else if (str.startsWith('+88')) str = str.slice(3);
              else if (str.startsWith('88')) str = str.slice(2);
              if (/^1[3-9]\d{8}$/.test(str)) {
                return '0' + str;
              }
              return str;
            };

            // Build the exact payload from Google Sheet row data
            const sheetPayload = {
              teamName: String(gData.teamName || (reg ? reg.teamName : '') || ''),
              leader: {
                name: String(gData.leaderName || ''),
                roll: String(gData.leaderRoll || ''),
                department: String(gData.leaderDepartment || 'Textile Engineering'),
                whatsapp: formatBdPhone(gData.leaderWhatsApp),
                facebook: String(gData.leaderFacebook || ''),
                email: String(gData.leaderEmail || gData.email || ''),
                photoUrl: String(gData.leaderPhotoUrl || ''),
                photoPreview: String(gData.leaderPhotoUrl || '')
              },
              member1: {
                name: String(gData.member1Name || ''),
                roll: String(gData.member1Roll || ''),
                department: String(gData.member1Department || 'Textile Engineering'),
                whatsapp: formatBdPhone(gData.member1WhatsApp),
                facebook: String(gData.member1Facebook || ''),
                email: String(gData.member1Email || ''),
                photoUrl: String(gData.member1PhotoUrl || ''),
                photoPreview: String(gData.member1PhotoUrl || '')
              },
              member2: {
                name: String(gData.member2Name || ''),
                roll: String(gData.member2Roll || ''),
                department: String(gData.member2Department || 'Textile Engineering'),
                whatsapp: formatBdPhone(gData.member2WhatsApp),
                facebook: String(gData.member2Facebook || ''),
                email: String(gData.member2Email || ''),
                photoUrl: String(gData.member2PhotoUrl || ''),
                photoPreview: String(gData.member2PhotoUrl || '')
              },
              payment: {
                bkashNumber: formatBdPhone(gData.bkashNumber),
                transactionId: String(gData.transactionId || '')
              }
            };

            if (reg) {
              // Overwrite with live Google Sheets data
              reg.registrationId = gData.registrationId || reg.registrationId;
              reg.submissionDate = gData.submissionDate || reg.submissionDate;
              reg.paymentStatus = liveStatus;
              reg.teamName = String(gData.teamName || reg.teamName || '').trim();
              reg.leaderRoll = String(gData.leaderRoll || reg.leaderRoll).trim();
              reg.m1Roll = String(gData.member1Roll || reg.m1Roll).trim();
              reg.m2Roll = String(gData.member2Roll || reg.m2Roll).trim();
              reg.transactionId = String(gData.transactionId || reg.transactionId).trim().toUpperCase();
              reg.payload = sheetPayload;
            } else {
              // Create registration record directly from Google Sheets
              reg = {
                registrationId: gData.registrationId || requestedId,
                submissionDate: gData.submissionDate || new Date().toISOString(),
                paymentStatus: liveStatus,
                teamName: String(gData.teamName || '').trim(),
                leaderRoll: String(gData.leaderRoll || '').trim(),
                m1Roll: String(gData.member1Roll || '').trim(),
                m2Roll: String(gData.member2Roll || '').trim(),
                transactionId: String(gData.transactionId || '').trim().toUpperCase(),
                editCount: 0,
                maxEdits: 3,
                payload: sheetPayload
              };
              registrationsStore.push(reg);
            }
          }
        }
      } catch (gErr: any) {
        console.warn('[REGISTRATION] Google Sheets live status check notice:', gErr.message);
      }
    }

    if (!reg) {
      return res.status(404).json({
        success: false,
        error: `No registration record found for "${requestedId}". Please check the registration number and retry.`
      });
    }

    const reqRoll = String(req.query?.leaderRoll || req.headers['x-leader-roll'] || '').trim();
    const reqMobile = String(req.query?.leaderMobile || req.headers['x-leader-mobile'] || '').trim().replace(/[\s\-()]/g, '');

    if (reqRoll) {
      const storedRoll = String(reg.leaderRoll || reg.payload?.leader?.roll || '').trim();
      if (storedRoll && storedRoll.toLowerCase() !== reqRoll.toLowerCase()) {
        return res.status(401).json({
          success: false,
          error: 'Security verification failed: Leader Roll number does not match this registration.'
        });
      }
    }

    if (reqMobile) {
      const normalizePhone = (num: any) => {
        if (!num) return '';
        const digits = String(num).replace(/\D/g, '');
        return digits.slice(-10); // Match last 10 digits regardless of leading 0 or +88
      };

      const cleanReq = normalizePhone(reqMobile);
      const cleanStored = normalizePhone(reg.payload?.leader?.whatsapp || '');
      const cleanStoredM1 = normalizePhone(reg.payload?.member1?.whatsapp || '');
      const cleanStoredM2 = normalizePhone(reg.payload?.member2?.whatsapp || '');

      const isMatch = (cleanStored && cleanStored === cleanReq) ||
                      (cleanStoredM1 && cleanStoredM1 === cleanReq) ||
                      (cleanStoredM2 && cleanStoredM2 === cleanReq);

      if (!isMatch && cleanReq.length >= 6) {
        return res.status(401).json({
          success: false,
          error: 'Security verification failed: Mobile number does not match this registration record.'
        });
      }
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

  // Update Payment Status endpoint (Admin/Sync endpoint)
  app.post('/api/registration/update-status', async (req: Request, res: Response) => {
    const { registrationId, paymentStatus, status } = req.body;
    const cleanId = String(registrationId || '').trim().toUpperCase();
    const newStatus = String(paymentStatus || status || 'Paid').trim();

    if (!cleanId) {
      return res.status(400).json({ success: false, error: 'Registration ID is required.' });
    }

    const reg = registrationsStore.find(r => r.registrationId.trim().toUpperCase() === cleanId);
    if (reg) {
      reg.paymentStatus = newStatus as any;
    }

    // Also forward update to Google Apps Script if configured
    const targetScriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL;
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
      } catch (sheetErr: any) {
        console.warn('[REGISTRATION] Google Sheets status sync error:', sheetErr.message);
      }
    }

    return res.json({
      success: true,
      message: `Payment status updated to "${newStatus}" for ${cleanId}.`,
      registrationId: cleanId,
      paymentStatus: newStatus,
      sheetUpdated
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
      teamName: String(registration.formData?.teamName || registration.teamName || '').trim(),
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
          teamName: String(backup.formData?.teamName || backup.teamName || '').trim(),
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
      if (updatedData.teamName) {
        reg.teamName = String(updatedData.teamName).trim();
      }
      reg.leaderRoll = newLeaderRoll;
      reg.m1Roll = newM1Roll;
      reg.m2Roll = newM2Roll;
      reg.editCount = currentEdits + 1;
      reg.lastEditedAt = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

      // Forward the edit to Google Apps Script / Google Sheets
      const activeScriptUrl = getActiveScriptUrl(req);
      let sheetUpdated = false;
      if (activeScriptUrl && activeScriptUrl.startsWith('http')) {
        try {
          const scriptRes = await fetch(activeScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'updateRegistration',
              registrationId: requestedId,
              formData: reg.payload
            }),
            redirect: 'follow'
          });
          const scriptJson: any = await scriptRes.json();
          if (scriptJson && scriptJson.success) {
            sheetUpdated = true;
            console.log(`[EDIT] Google Sheet row updated successfully for ${requestedId}`);
          }
        } catch (sheetErr: any) {
          console.warn('[EDIT] Google Sheets sync error during update:', sheetErr.message);
        }
      }

      const remaining = Math.max(0, 3 - reg.editCount);

      return res.json({
        success: true,
        message: `Registration updated successfully. You have ${remaining} of 3 edits remaining.`,
        sheetUpdated,
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
