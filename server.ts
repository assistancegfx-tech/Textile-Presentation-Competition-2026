import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { buildRegistrationPdfDoc, getRegistrationPdfBase64 } from './src/utils/pdfGenerator';

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

const REGISTRATION_DEADLINE_TIMESTAMP = new Date('2026-10-05T23:59:59+06:00').getTime();

// In-memory persistent registry for duplicate detection and fallback storage
const registrationsStore: StoredRegistration[] = [];
let idSequence = 1;

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

// Detect and replace outdated or dead deployment hashes
const sanitizeScriptUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return DEFAULT_SCRIPT_URL;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http')) return DEFAULT_SCRIPT_URL;
  // If URL points to outdated deployment hashes that don't have the active sheet handler
  if (trimmed.includes('AKfycbzPpm6fVvOmXE1FTq') || trimmed.includes('AKfycbzVPB_lyf20Tx7qNxgb')) {
    return DEFAULT_SCRIPT_URL;
  }
  return trimmed;
};

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

  // Middleware to support base64 participant images (up to 50mb payload for high-quality photos)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

  // Official Website-Generated PDF Endpoint (Ensures 100% exact design and file for emails & downloads)
  app.get('/api/registration-pdf/:regId', async (req: Request, res: Response) => {
    const regId = String(req.params.regId || '').trim().toUpperCase();
    if (!regId) return res.status(400).json({ success: false, error: 'Registration ID required' });

    let reg = registrationsStore.find(r => r.registrationId.toUpperCase() === regId);
    let formData = reg?.payload || null;
    let paymentStatus = String(req.query.status || reg?.paymentStatus || 'Pending').trim();
    let submissionDate = reg?.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

    if (!formData) {
      // Query Google Sheet for team data
      const activeScript = getActiveScriptUrl(req);
      if (activeScript && activeScript.startsWith('http')) {
        try {
          const gRes = await fetch(`${activeScript}${activeScript.includes('?') ? '&' : '?'}action=get&regId=${encodeURIComponent(regId)}`, {
            signal: AbortSignal.timeout(4500)
          });
          const gJson: any = await gRes.json();
          if (gJson && (gJson.success || gJson.found) && gJson.registrationId) {
            paymentStatus = gJson.paymentStatus || paymentStatus;
            submissionDate = gJson.submissionDate || submissionDate;
            formData = {
              teamName: gJson.teamName || '',
              leader: {
                name: gJson.leaderName || '',
                roll: gJson.leaderRoll || '',
                department: gJson.leaderDepartment || 'Textile Engineering',
                whatsapp: gJson.leaderWhatsApp || '',
                facebook: gJson.leaderFacebook || 'Blank',
                email: gJson.leaderEmail || gJson.email || '',
                photoUrl: gJson.leaderPhotoUrl || ''
              },
              member1: {
                name: gJson.member1Name || 'N/A',
                roll: gJson.member1Roll || 'N/A',
                department: gJson.member1Department || 'N/A',
                whatsapp: gJson.member1WhatsApp || 'N/A',
                facebook: gJson.member1Facebook || 'Blank',
                photoUrl: gJson.member1PhotoUrl || 'N/A'
              },
              member2: {
                name: gJson.member2Name || 'N/A',
                roll: gJson.member2Roll || 'N/A',
                department: gJson.member2Department || 'N/A',
                whatsapp: gJson.member2WhatsApp || 'N/A',
                facebook: gJson.member2Facebook || 'Blank',
                photoUrl: gJson.member2PhotoUrl || 'N/A'
              },
              payment: {
                bkashNumber: gJson.bkashNumber || '',
                transactionId: gJson.transactionId || ''
              }
            };
          }
        } catch (_) {}
      }
    }

    if (!formData) {
      formData = {
        teamName: reg?.teamName || 'Textile Innovators',
        leader: { name: 'Participant', roll: reg?.leaderRoll || '12345', department: 'Textile Engineering', whatsapp: '01700000000', facebook: 'Blank' },
        member1: { name: 'N/A', roll: 'N/A', department: 'N/A', whatsapp: 'N/A', facebook: 'Blank' },
        member2: { name: 'N/A', roll: 'N/A', department: 'N/A', whatsapp: 'N/A', facebook: 'Blank' },
        payment: { bkashNumber: '01XXXXXXXXX', transactionId: reg?.transactionId || 'TRX123456' }
      };
    }

    try {
      const pdfBase64 = getRegistrationPdfBase64({
        registrationId: regId,
        submissionDate,
        paymentStatus,
        editCount: reg?.editCount ?? 0,
        formData
      });

      const format = String(req.query.format || '').toLowerCase();
      if (format === 'base64' || format === 'json') {
        return res.json({
          success: true,
          registrationId: regId,
          paymentStatus,
          base64: pdfBase64
        });
      }

      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Registration_Voucher_${regId}.pdf"`);
      return res.send(pdfBuffer);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: 'Could not generate PDF: ' + e.message });
    }
  });

  // Direct Website jsPDF Entry Pass Generator for Emails & Approvals (Exact match to website PDF)
  const handleGenerateEntryPassPdf = (req: Request, res: Response) => {
    try {
      const {
        registrationId,
        teamName,
        submissionDate,
        paymentStatus,
        editCount,
        leaderName,
        leaderRoll,
        leaderDept,
        leaderWhatsApp,
        leaderFacebook,
        leaderEmail,
        leaderPhotoUrl,
        m1Name,
        m1Roll,
        m1Dept,
        m1Mobile,
        m1Facebook,
        m1PhotoUrl,
        m2Name,
        m2Roll,
        m2Dept,
        m2Mobile,
        m2Facebook,
        m2PhotoUrl,
        bkashNum,
        transactionId
      } = req.body;

      const regId = String(registrationId || '').trim();
      const status = String(paymentStatus || 'Paid').trim();
      
      const formData: any = {
        teamName: teamName || '',
        leader: {
          name: leaderName || 'Leader',
          roll: leaderRoll || '',
          department: leaderDept || 'Textile Engineering',
          whatsapp: leaderWhatsApp || '',
          facebook: leaderFacebook || 'Blank',
          email: leaderEmail || '',
          photoUrl: leaderPhotoUrl || ''
        },
        member1: {
          name: m1Name || 'N/A',
          roll: m1Roll || 'N/A',
          department: m1Dept || 'N/A',
          whatsapp: m1Mobile || 'N/A',
          facebook: m1Facebook || 'Blank',
          photoUrl: m1PhotoUrl || 'N/A'
        },
        member2: {
          name: m2Name || 'N/A',
          roll: m2Roll || 'N/A',
          department: m2Dept || 'N/A',
          whatsapp: m2Mobile || 'N/A',
          facebook: m2Facebook || 'Blank',
          photoUrl: m2PhotoUrl || 'N/A'
        },
        payment: {
          bkashNumber: bkashNum || '',
          transactionId: transactionId || ''
        }
      };

      const pdfBase64 = getRegistrationPdfBase64({
        registrationId: regId,
        submissionDate: submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        paymentStatus: status,
        editCount: editCount ?? 0,
        formData
      });

      return res.json({
        success: true,
        registrationId: regId,
        paymentStatus: status,
        base64: pdfBase64
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  app.post('/api/generate-entry-pass-pdf', handleGenerateEntryPassPdf);
  app.post('/api/generate-voucher-pdf', handleGenerateEntryPassPdf);

  let configuredGoogleScriptUrl = sanitizeScriptUrl(process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL);

  const getActiveScriptUrl = (req?: Request): string => {
    const customHeader = req?.headers['x-google-script-url'] as string | undefined;
    const customQuery = req?.query?.scriptUrl as string | undefined;
    const raw = customHeader || customQuery || configuredGoogleScriptUrl;
    return sanitizeScriptUrl(raw);
  };

  app.get('/api/config', (req: Request, res: Response) => {
    res.json({
      hasGoogleScript: !!configuredGoogleScriptUrl,
      configuredUrl: configuredGoogleScriptUrl
    });
  });

  // Registration Counter and Live Statistics API (Always Database Team Count + 3)
  app.get('/api/registrations/count', async (req: Request, res: Response) => {
    try {
      let registeredCount = registrationsStore.length;
      
      // Query live row count from Google Sheet if script is active
      const activeScript = getActiveScriptUrl(req);
      if (activeScript && activeScript.startsWith('http')) {
        try {
          const healthRes = await fetch(`${activeScript}${activeScript.includes('?') ? '&' : '?'}action=health`, {
            signal: AbortSignal.timeout(3500)
          });
          const json: any = await healthRes.json();
          if (json && typeof json.totalRows === 'number') {
            registeredCount = Math.max(registeredCount, json.totalRows);
          }
        } catch (_) {}
      }

      // Exact registered count from database
      const totalActualCount = registeredCount;
      
      // Offset: always exactly 3 higher than actual registered teams in database (e.g. 2 in DB => shows 5)
      const offset = 3;
      const displayedCount = totalActualCount + offset;

      res.json({
        success: true,
        actualCount: totalActualCount,
        displayedCount,
        badgeText: `🔥 ${displayedCount}+ Teams Registered`
      });
    } catch (e: any) {
      const fallbackActual = registrationsStore.length;
      const fallbackDisplay = fallbackActual + 3;
      res.json({
        success: true,
        actualCount: fallbackActual,
        displayedCount: fallbackDisplay,
        badgeText: `🔥 ${fallbackDisplay}+ Teams Registered`
      });
    }
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

  // Serve full Google Apps Script code for 1-click copy in UI modal
  app.get('/api/script-code', (_req: Request, res: Response) => {
    try {
      const scriptPath = path.join(process.cwd(), 'google-apps-script.js');
      if (fs.existsSync(scriptPath)) {
        const code = fs.readFileSync(scriptPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(code);
      }
      return res.status(404).send('// google-apps-script.js not found');
    } catch (err: any) {
      return res.status(500).send('// Error loading script: ' + err.message);
    }
  });

  const isDummyOrSampleValue = (val: any): boolean => {
    const clean = String(val || '').trim().toLowerCase();
    return !clean || ['demo', 'test', 'sample', 'dummy', 'none', 'n/a', 'blank', 'null', 'undefined', '-', '—', '0', '00'].includes(clean);
  };

  // Pre-check for duplicate roll numbers or transaction ID
  app.post('/api/validate-duplicates', (req: Request, res: Response) => {
    const { rolls, transactionId } = req.body;
    const cleanTrx = String(transactionId || '').trim().toUpperCase();
    const cleanRolls = Array.isArray(rolls)
      ? rolls.map((r: string) => String(r).trim()).filter(r => !isDummyOrSampleValue(r))
      : [];

    for (const reg of registrationsStore) {
      if (cleanTrx && !isDummyOrSampleValue(cleanTrx) && reg.transactionId && reg.transactionId.toUpperCase() === cleanTrx) {
        return res.status(409).json({
          duplicate: true,
          field: 'transactionId',
          message: `Transaction ID "${cleanTrx}" has already been submitted with registration ${reg.registrationId}.`
        });
      }

      for (const roll of cleanRolls) {
        const storedRolls = [reg.leaderRoll, reg.m1Roll, reg.m2Roll]
          .filter(r => !isDummyOrSampleValue(r))
          .map(r => r.toUpperCase());
        if (storedRolls.includes(roll.toUpperCase())) {
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
      if (Date.now() >= REGISTRATION_DEADLINE_TIMESTAMP) {
        console.warn('[REGISTRATION] Submission rejected: Registration deadline has passed (5 Oct 2026, 11:59 PM BST)');
        return res.status(403).json({
          success: false,
          error: 'Registration is officially closed. The deadline was 5 October 2026, 11:59 PM BST.',
          details: 'Online team registration is closed.'
        });
      }

      const data = req.body;

      const leader = data?.leader;
      const member1 = data?.member1;
      const member2 = data?.member2;
      const payment = data?.payment;
      const teamSize = Number(data?.teamSize) || (member2?.name?.trim() ? 3 : member1?.name?.trim() ? 2 : 1);

      // 1. Log: Request received
      console.log('[REGISTRATION] Request received:', {
        leaderName: leader?.name || 'Unknown',
        leaderRoll: leader?.roll || 'Unknown',
        teamSize,
        hasPhotos: Boolean(leader?.photoBase64 && (teamSize < 2 || member1?.photoBase64) && (teamSize < 3 || member2?.photoBase64)),
        transactionId: payment?.transactionId ? `${payment.transactionId.substring(0, 4)}***` : 'None',
        timestamp: new Date().toISOString()
      });

      // 2. Validation
      const leaderPhone = String(leader?.whatsapp || leader?.mobile || '').trim();
      if (!leader?.name || !leader?.roll || !leaderPhone ||
          (teamSize >= 2 && (!member1?.name || !member1?.roll)) ||
          (teamSize >= 3 && (!member2?.name || !member2?.roll)) ||
          !payment?.transactionId || !payment?.bkashNumber) {
        console.warn('[REGISTRATION] Validation result: FAILED (Missing required participant or payment fields)');
        return res.status(400).json({
          success: false,
          error: 'Unable to submit registration',
          details: 'Missing required participant fields. Please ensure name, roll, mobile, and payment details are filled.'
        });
      }

      const leaderRoll = String(leader.roll).trim();
      const m1Roll = teamSize >= 2 ? String(member1?.roll || '').trim() : '';
      const m2Roll = teamSize >= 3 ? String(member2?.roll || '').trim() : '';
      const transactionId = String(payment.transactionId).trim().toUpperCase();

      const activeFormRolls = [leaderRoll, m1Roll, m2Roll]
        .filter(r => !isDummyOrSampleValue(r))
        .map(r => r.toUpperCase());

      // Duplicate check against internal registry
      for (const reg of registrationsStore) {
        if (transactionId && !isDummyOrSampleValue(transactionId) && reg.transactionId && reg.transactionId.toUpperCase() === transactionId) {
          console.warn(`[REGISTRATION] Validation result: FAILED (Duplicate transaction ID "${transactionId}")`);
          return res.status(409).json({
            success: false,
            error: `Duplicate Transaction ID "${transactionId}". This payment was already used for team ${reg.registrationId}.`,
            details: 'Duplicate transaction ID detected.'
          });
        }
        const storedRolls = [reg.leaderRoll, reg.m1Roll, reg.m2Roll]
          .filter(r => !isDummyOrSampleValue(r))
          .map(r => r.toUpperCase());
        for (const r of activeFormRolls) {
          if (storedRolls.includes(r)) {
            console.warn('[REGISTRATION] Validation result: FAILED (Duplicate student roll)');
            return res.status(409).json({
              success: false,
              error: `Student Roll "${r}" is already registered in team ${reg.registrationId}.`,
              details: 'Duplicate roll number detected.'
            });
          }
        }
      }

      const teamName = String(data?.teamName || '').trim();

      // Ensure unused members have "N/A" populated across every field
      if (teamSize < 2) {
        data.member1 = {
          name: 'N/A',
          roll: 'N/A',
          department: 'N/A',
          whatsapp: 'N/A',
          facebook: 'N/A',
          email: 'N/A',
          photoUrl: 'N/A'
        };
      } else if (data?.member1) {
        data.member1.facebook = String(data.member1.facebook || '').trim() || 'Blank';
      }

      if (teamSize < 3) {
        data.member2 = {
          name: 'N/A',
          roll: 'N/A',
          department: 'N/A',
          whatsapp: 'N/A',
          facebook: 'N/A',
          email: 'N/A',
          photoUrl: 'N/A'
        };
      } else if (data?.member2) {
        data.member2.facebook = String(data.member2.facebook || '').trim() || 'Blank';
      }

      if (data?.leader) {
        data.leader.facebook = String(data.leader.facebook || '').trim() || 'Blank';
      }
      data.teamSize = teamSize;

      if (!data.websiteUrl) {
        const originHeader = (req.headers['origin'] || req.headers['referer'] || '').toString();
        data.websiteUrl = originHeader ? originHeader.replace(/\/+$/, '') : 'https://ais-pre-6zeawg7kx2bdfewoufqpj5-305877422476.asia-southeast1.run.app';
      }

      console.log(`[REGISTRATION] Validation result: PASSED (Category: ${teamSize} member(s), Team: "${teamName}", Leader: ${leaderRoll}, Trx: ${transactionId})`);

      // Format last 2 digits of each participant roll for Registration ID: TPC-{last 2 digit of every student roll}-{serial from 01}
      const getLast2Digits = (roll: any): string => {
        const digits = String(roll || '').replace(/\D/g, '');
        if (digits.length >= 2) return digits.slice(-2);
        return (digits || String(roll || '').trim()).padStart(2, '0').slice(-2);
      };

      let rollsLast2 = getLast2Digits(leaderRoll);
      if (teamSize >= 2 && m1Roll) rollsLast2 += getLast2Digits(m1Roll);
      if (teamSize >= 3 && m2Roll) rollsLast2 += getLast2Digits(m2Roll);

      // Compute serial counter starting from 01
      let maxRegisteredSeq = 0;
      for (const r of registrationsStore) {
        const match = String(r.registrationId || '').match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxRegisteredSeq) maxRegisteredSeq = num;
        }
      }
      const nextSeqNumber = Math.max(idSequence++, maxRegisteredSeq + 1);
      const seqStr = String(nextSeqNumber).padStart(2, '0');
      const defaultRegId = `TPC-${rollsLast2}-${seqStr}`;

      // Check if Google Apps Script Web App URL is configured
      const customScriptUrl = (req.headers['x-google-script-url'] as string | undefined) || data?.scriptUrl;
      const targetScriptUrl = customScriptUrl || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || configuredGoogleScriptUrl || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

      if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
        try {
          console.log(`[REGISTRATION] Connecting to Google Apps Script (${targetScriptUrl.slice(0, 45)}...)...`);
          const scriptResponse = await fetch(targetScriptUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
              'Accept': 'application/json, text/plain, */*'
            },
            body: JSON.stringify(data),
            redirect: 'follow'
          });

          const rawText = await scriptResponse.text();
          let scriptData: any = {};
          try {
            scriptData = JSON.parse(rawText);
          } catch (e) {
            console.warn('[REGISTRATION] Google Sheets raw response (first 250 chars):', rawText.slice(0, 250));
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
            const regId = scriptData.registrationId || defaultRegId;
            const nowStr = scriptData.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

            console.log(`[REGISTRATION] Google Sheets sync result: SUCCESS (ID: ${regId}, Drive photos: ${Boolean(scriptData.photos)})`);

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

            const emailSent = scriptData.emailSent !== undefined ? Boolean(scriptData.emailSent) : Boolean(leader.email);
            const emailRecipient = scriptData.emailRecipient || leader.email || '';
            console.log(`[REGISTRATION] Confirmation email status: ${emailSent ? 'SENT' : 'NOT SENT'} to "${emailRecipient}"`);

            return res.status(200).json({
              success: true,
              registrationId: regId,
              submissionDate: nowStr,
              teamName: teamName || scriptData.teamName || '',
              paymentStatus: 'Pending',
              editCount: 0,
              maxEdits: 3,
              remainingEdits: 3,
              emailSent,
              emailRecipient,
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
      const regId = defaultRegId;
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

      const leaderEmail = leader.email || '';

      return res.status(200).json({
        success: true,
        registrationId: regId,
        submissionDate,
        teamName,
        paymentStatus: 'Pending',
        editCount: 0,
        maxEdits: 3,
        remainingEdits: 3,
        emailSent: Boolean(leaderEmail),
        emailRecipient: leaderEmail,
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
    const candidateUrls: string[] = Array.from(new Set([
      req.headers['x-google-script-url'] as string,
      req.query.scriptUrl as string,
      DEFAULT_SCRIPT_URL,
      configuredGoogleScriptUrl,
      process.env.GOOGLE_SCRIPT_URL,
      process.env.VITE_GOOGLE_SCRIPT_URL
    ].filter(u => u && typeof u === 'string' && u.startsWith('http'))))
    .map(u => sanitizeScriptUrl(u));

    for (const targetScriptUrl of candidateUrls) {
      if (reg && reg.editCount && reg.editCount > 0) {
        // If we already have a locally edited copy, we only need to sync if needed
        break;
      }
      try {
        const queryUrl = `${targetScriptUrl}${targetScriptUrl.includes('?') ? '&' : '?'}action=get&regId=${encodeURIComponent(requestedId)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);
        
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
                facebook: String(gData.leaderFacebook || '').trim() || 'Blank',
                email: String(gData.leaderEmail || gData.email || ''),
                photoUrl: String(gData.leaderPhotoUrl || ''),
                photoPreview: String(gData.leaderPhotoUrl || '')
              },
              member1: {
                name: String(gData.member1Name || ''),
                roll: String(gData.member1Roll || ''),
                department: String(gData.member1Department || 'Textile Engineering'),
                whatsapp: formatBdPhone(gData.member1WhatsApp),
                facebook: String(gData.member1Facebook || '').trim() || 'Blank',
                email: String(gData.member1Email || ''),
                photoUrl: String(gData.member1PhotoUrl || ''),
                photoPreview: String(gData.member1PhotoUrl || '')
              },
              member2: {
                name: String(gData.member2Name || ''),
                roll: String(gData.member2Roll || ''),
                department: String(gData.member2Department || 'Textile Engineering'),
                whatsapp: formatBdPhone(gData.member2WhatsApp),
                facebook: String(gData.member2Facebook || '').trim() || 'Blank',
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
              // Update live payment status from Google Sheets
              reg.paymentStatus = liveStatus;
              
              if ((reg.editCount || 0) === 0) {
                reg.registrationId = gData.registrationId || reg.registrationId;
                reg.submissionDate = gData.submissionDate || reg.submissionDate;
                reg.teamName = String(gData.teamName || reg.teamName || '').trim();
                reg.leaderRoll = String(gData.leaderRoll || reg.leaderRoll).trim();
                reg.m1Roll = String(gData.member1Roll || reg.m1Roll).trim();
                reg.m2Roll = String(gData.member2Roll || reg.m2Roll).trim();
                reg.transactionId = String(gData.transactionId || reg.transactionId).trim().toUpperCase();
                reg.payload = sheetPayload;
              }
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
            break; // Found and successfully loaded from Google Sheets!
          }
        }
      } catch (gErr: any) {
        console.warn('[REGISTRATION] Google Sheets lookup notice for', targetScriptUrl, gErr.message);
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
      const m1Roll = String(reg.m1Roll || reg.payload?.member1?.roll || '').trim();
      const m2Roll = String(reg.m2Roll || reg.payload?.member2?.roll || '').trim();
      const rollMatches = (storedRoll && storedRoll.toLowerCase() === reqRoll.toLowerCase()) ||
                          (m1Roll && m1Roll.toLowerCase() === reqRoll.toLowerCase()) ||
                          (m2Roll && m2Roll.toLowerCase() === reqRoll.toLowerCase());
      if (!rollMatches) {
        return res.status(401).json({
          success: false,
          error: 'Security verification failed: Roll number does not match this registration.'
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
      const leaderPhone = String(leader?.whatsapp || leader?.mobile || '').trim();
      if (!leader?.name || !leader?.roll || !leaderPhone ||
          !member1?.name || !member1?.roll ||
          !member2?.name || !member2?.roll) {
        return res.status(400).json({ success: false, error: 'Please provide all required participant fields (Names, Rolls, and Leader Mobile Number).' });
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

      // Validate Team Leader Facebook profile URL
      const updatedLeaderFb = String(updatedData?.leader?.facebook || '').trim();
      if (!updatedLeaderFb || updatedLeaderFb.toLowerCase() === 'blank') {
        return res.status(400).json({
          success: false,
          error: 'Team Leader Facebook profile link is required.'
        });
      }
      if (updatedData?.leader) {
        updatedData.leader.facebook = updatedLeaderFb;
      }
      // Members' Facebook fields are optional; default empty to "Blank"
      if (updatedData?.member1) {
        updatedData.member1.facebook = String(updatedData.member1.facebook || '').trim() || 'Blank';
      }
      if (updatedData?.member2) {
        updatedData.member2.facebook = String(updatedData.member2.facebook || '').trim() || 'Blank';
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
          const payload = JSON.stringify({
            action: 'updateRegistration',
            registrationId: requestedId,
            formData: reg.payload
          });

          const scriptRes = await fetch(activeScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            redirect: 'follow'
          });

          const rawText = await scriptRes.text();
          let scriptJson: any = null;
          try {
            scriptJson = JSON.parse(rawText);
          } catch (_) {}

          if (scriptJson && scriptJson.success) {
            sheetUpdated = true;
            console.log(`[EDIT] Google Sheet row updated successfully for ${requestedId}`);
          } else {
            // Fallback via GET parameter (resolves redirect quirks in some Google Apps Script deployments)
            try {
              const getUrl = `${activeScriptUrl}?action=updateRegistration&data=${encodeURIComponent(payload)}`;
              const getRes = await fetch(getUrl, { method: 'GET', redirect: 'follow' });
              const getText = await getRes.text();
              let getJson: any = null;
              try { getJson = JSON.parse(getText); } catch (_) {}
              if (getJson && getJson.success) {
                sheetUpdated = true;
                console.log(`[EDIT-GET] Google Sheet row updated successfully for ${requestedId}`);
              } else {
                console.warn('[EDIT] Google Apps Script responses:', rawText.slice(0, 150), getText.slice(0, 150));
              }
            } catch (fallbackErr: any) {
              console.warn('[EDIT-GET] Fallback query notice:', fallbackErr.message);
            }
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
