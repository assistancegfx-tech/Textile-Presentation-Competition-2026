import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  end: (cb?: () => void) => this;
}

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const queryScriptUrl = (Array.isArray(req.query?.scriptUrl) ? req.query?.scriptUrl[0] : req.query?.scriptUrl) as string | undefined;
  const scriptUrl = queryScriptUrl || (req.headers['x-google-script-url'] as string) || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || DEFAULT_SCRIPT_URL;

  let presentationRegistrations: any[] = [];
  let blitzRegistrations: any[] = [];

  try {
    // 1. Health check to get total rows
    const healthUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=health&_t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const healthRes = await fetch(healthUrl, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeoutId);

    if (healthRes.ok) {
      const healthData: any = await healthRes.json();
      const totalRows = Number(healthData.totalRows || 0);

      if (totalRows > 0) {
        const fetchCount = Math.min(totalRows, 40);
        const rowPromises = Array.from({ length: fetchCount }, (_, i) => {
          const pad = String(i + 1).padStart(2, '0');
          const rowUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=get&regId=${pad}&_t=${Date.now()}`;
          return fetch(rowUrl, { redirect: 'follow' })
            .then(r => r.json())
            .catch(() => null);
        });

        const results = await Promise.all(rowPromises);

        for (const item of results) {
          if (!item || (!item.found && !item.registrationId)) continue;
          const regId = String(item.registrationId || '').trim();
          if (!regId) continue;

          const formatBdPhone = (phone: any): string => {
            if (!phone) return '';
            let str = String(phone).trim().replace(/[\s\-()]/g, '');
            if (str.startsWith('+880')) str = str.slice(4);
            else if (str.startsWith('880')) str = str.slice(3);
            else if (str.startsWith('+88')) str = str.slice(3);
            else if (str.startsWith('88')) str = str.slice(2);
            if (/^1[3-9]\d{8}$/.test(str)) return '0' + str;
            return str;
          };

          presentationRegistrations.push({
            registrationId: regId,
            submissionDate: item.submissionDate || new Date().toISOString(),
            paymentStatus: String(item.paymentStatus || 'Approved').trim(),
            teamName: String(item.teamName || '').trim(),
            leaderName: String(item.leaderName || '').trim(),
            leaderRoll: String(item.leaderRoll || '').trim(),
            leaderDepartment: String(item.leaderDepartment || 'Textile Engineering').trim(),
            leaderWhatsApp: formatBdPhone(item.leaderWhatsApp),
            leaderFacebook: String(item.leaderFacebook || '').trim(),
            leaderEmail: String(item.leaderEmail || item.email || '').trim(),
            leaderPhotoUrl: String(item.leaderPhotoUrl || '').trim(),
            member1Name: String(item.member1Name || '').trim(),
            member1Roll: String(item.member1Roll || '').trim(),
            member1Department: String(item.member1Department || 'Textile Engineering').trim(),
            member1WhatsApp: formatBdPhone(item.member1WhatsApp),
            member1Facebook: String(item.member1Facebook || '').trim(),
            member1PhotoUrl: String(item.member1PhotoUrl || '').trim(),
            member2Name: String(item.member2Name || '').trim(),
            member2Roll: String(item.member2Roll || '').trim(),
            member2Department: String(item.member2Department || 'Textile Engineering').trim(),
            member2WhatsApp: formatBdPhone(item.member2WhatsApp),
            member2Facebook: String(item.member2Facebook || '').trim(),
            member2PhotoUrl: String(item.member2PhotoUrl || '').trim(),
            bkashNumber: formatBdPhone(item.bkashNumber),
            transactionId: String(item.transactionId || '').trim().toUpperCase()
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[VERCEL ADMIN] Google Sheet live fetch notice:', err.message);
  }

  return res.status(200).json({
    success: true,
    presentationRegistrations,
    blitzRegistrations,
    fetchedFromSheet: presentationRegistrations.length > 0,
    totalRows: presentationRegistrations.length,
    scriptUrl
  });
}
