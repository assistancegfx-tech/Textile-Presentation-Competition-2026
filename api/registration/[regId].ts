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

  // GET: Fetch registration
  if (req.method === 'GET') {
    const reg = getRegistrationById(cleanId);
    if (!reg) {
      return res.status(404).json({
        success: false,
        error: `No registration record found for "${cleanId}". Please check the registration number and retry.`
      });
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
