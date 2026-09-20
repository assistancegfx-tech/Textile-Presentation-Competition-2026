import type { IncomingMessage, ServerResponse } from 'http';
import { getRegistrationById, registrationsStore } from '../_storage';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const regIdParam = req.query?.regId;
  const regId = Array.isArray(regIdParam) ? regIdParam[0] : regIdParam;
  const cleanId = String(regId || '').trim().toUpperCase();

  if (!cleanId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid Registration Number.'
    });
  }

  // GET: Fetch registration with verification & live Google Sheets sync
  if (req.method === 'GET') {
    let reg = getRegistrationById(cleanId);

    // Live Google Sheets synchronization
    const customScriptUrl = (req.headers['x-google-script-url'] || (req as any).headers?.['x-google-script-url']) as string | undefined;
    const targetScriptUrl = customScriptUrl || (req.query?.scriptUrl as string) || process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

    if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        const queryUrl = `${targetScriptUrl}${targetScriptUrl.includes('?') ? '&' : '?'}action=get&regId=${encodeURIComponent(cleanId)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const gRes = await fetch(queryUrl, { signal: controller.signal, redirect: 'follow' });
        clearTimeout(timeoutId);
        
        if (gRes.ok) {
          const gData: any = await gRes.json();
          if (gData && (gData.success || gData.found) && gData.registrationId) {
            const liveStatus = gData.paymentStatus || 'Pending';
            
            if (reg) {
              reg.paymentStatus = liveStatus;
              if (gData.leaderRoll) reg.leaderRoll = gData.leaderRoll;
              if (gData.transactionId) reg.transactionId = gData.transactionId;
            } else {
              reg = {
                registrationId: gData.registrationId || cleanId,
                submissionDate: gData.submissionDate || new Date().toISOString(),
                paymentStatus: liveStatus,
                leaderRoll: String(gData.leaderRoll || '').trim(),
                m1Roll: String(gData.member1Roll || '').trim(),
                m2Roll: String(gData.member2Roll || '').trim(),
                transactionId: String(gData.transactionId || '').trim().toUpperCase(),
                editCount: 0,
                maxEdits: 3,
                payload: {
                  leader: {
                    name: gData.leaderName || '',
                    roll: gData.leaderRoll || '',
                    department: gData.leaderDepartment || 'Textile Engineering',
                    whatsapp: gData.leaderWhatsApp || '',
                    facebook: gData.leaderFacebook || '',
                    photoUrl: gData.leaderPhotoUrl || ''
                  },
                  member1: {
                    name: gData.member1Name || '',
                    roll: gData.member1Roll || '',
                    department: gData.member1Department || 'Textile Engineering',
                    whatsapp: gData.member1WhatsApp || '',
                    facebook: gData.member1Facebook || '',
                    photoUrl: gData.member1PhotoUrl || ''
                  },
                  member2: {
                    name: gData.member2Name || '',
                    roll: gData.member2Roll || '',
                    department: gData.member2Department || 'Textile Engineering',
                    whatsapp: gData.member2WhatsApp || '',
                    facebook: gData.member2Facebook || '',
                    photoUrl: gData.member2PhotoUrl || ''
                  },
                  payment: {
                    bkashNumber: gData.bkashNumber || '',
                    transactionId: gData.transactionId || ''
                  }
                }
              };
              registrationsStore.push(reg);
            }
          }
        }
      } catch (gErr: any) {
        console.warn('[REGISTRATION] Google Sheets live check notice:', gErr.message);
      }
    }

    if (!reg) {
      return res.status(404).json({
        success: false,
        error: `No registration record found for "${cleanId}". Please check the registration number and retry.`
      });
    }

    const leaderRollParam = req.query?.leaderRoll || req.headers['x-leader-roll'];
    const leaderMobileParam = req.query?.leaderMobile || req.headers['x-leader-mobile'];
    
    const reqRoll = String(Array.isArray(leaderRollParam) ? leaderRollParam[0] : (leaderRollParam || '')).trim();
    const reqMobile = String(Array.isArray(leaderMobileParam) ? leaderMobileParam[0] : (leaderMobileParam || '')).trim().replace(/[\s\-()]/g, '');

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
      const storedMobile = String(reg.payload?.leader?.whatsapp || '').trim().replace(/[\s\-()]/g, '');
      const cleanStored = storedMobile.startsWith('+88') ? storedMobile.slice(3) : storedMobile.startsWith('88') ? storedMobile.slice(2) : storedMobile;
      const cleanReq = reqMobile.startsWith('+88') ? reqMobile.slice(3) : reqMobile.startsWith('88') ? reqMobile.slice(2) : reqMobile;
      if (cleanStored && cleanStored !== cleanReq) {
        return res.status(401).json({
          success: false,
          error: 'Security verification failed: Leader Mobile number does not match this registration.'
        });
      }
    }

    const editCount = reg.editCount ?? 0;
    const maxEdits = reg.maxEdits ?? 3;
    const remainingEdits = Math.max(0, maxEdits - editCount);

    return res.status(200).json({
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
  }

  // PUT: Update registration (up to 3 edits)
  if (req.method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const updatedData = body?.formData;
      if (!updatedData) {
        return res.status(400).json({
          success: false,
          error: 'Invalid update payload or missing team data.'
        });
      }

      let reg = getRegistrationById(cleanId);
      if (!reg && body?.backupRegistration) {
        const backup = body.backupRegistration;
        reg = {
          registrationId: backup.registrationId || cleanId,
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
          error: `Registration "${cleanId}" not found. Unable to apply edit.`
        });
      }

      const currentEdits = reg.editCount ?? 0;
      if (currentEdits >= 3) {
        return res.status(403).json({
          success: false,
          error: `Maximum edit limit reached (3 of 3 edits used). Changes are locked for registration ${cleanId}.`
        });
      }

      const leader = updatedData.leader;
      const member1 = updatedData.member1;
      const member2 = updatedData.member2;
      if (!leader?.name || !leader?.roll || !member1?.name || !member1?.roll || !member2?.name || !member2?.roll) {
        return res.status(400).json({
          success: false,
          error: 'Please provide all required participant fields.'
        });
      }

      const newLeaderRoll = String(leader.roll).trim();
      const newM1Roll = String(member1.roll).trim();
      const newM2Roll = String(member2.roll).trim();

      // Ensure no collision with other teams
      for (const other of registrationsStore) {
        if (other.registrationId.toUpperCase() === cleanId) continue;
        if ([newLeaderRoll, newM1Roll, newM2Roll].some(r => [other.leaderRoll, other.m1Roll, other.m2Roll].includes(r))) {
          return res.status(409).json({
            success: false,
            error: 'One or more of the updated student roll numbers are already registered with another team.'
          });
        }
      }

      reg.payload = {
        ...reg.payload,
        ...updatedData,
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

      return res.status(200).json({
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
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'An unexpected error occurred while saving edits.'
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method Not Allowed. Use GET or PUT.'
  });
}
