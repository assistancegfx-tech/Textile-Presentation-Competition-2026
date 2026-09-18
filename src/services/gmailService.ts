import { RegistrationFormData } from '../types';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
}

/**
 * Base64 URL safe encoder for RFC 2822 email format required by Gmail API.
 */
function createRawEmail(to: string, subject: string, htmlContent: string, from?: string): string {
  // UTF-8 friendly base64 encoding for Subject header
  const encodedSubject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const lines = [
    `To: ${to}`,
    from ? `From: ${from}` : '',
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlContent,
  ].filter(Boolean).join('\r\n');

  return btoa(unescape(encodeURIComponent(lines)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Retrieve user's Gmail profile information.
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Gmail profile (${res.status})`);
  }

  return res.json();
}

/**
 * Send an email through the user's connected Gmail account.
 */
export async function sendGmailMessage(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    htmlBody: string;
    fromEmail?: string;
  }
): Promise<{ id: string; threadId: string; labelIds: string[] }> {
  const raw = createRawEmail(params.to, params.subject, params.htmlBody, params.fromEmail);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail send failed with HTTP status ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch recent sent or received messages matching a query.
 */
export async function listGmailMessages(
  accessToken: string,
  query?: string,
  maxResults = 8
): Promise<GmailMessageSummary[]> {
  const params = new URLSearchParams();
  params.set('maxResults', maxResults.toString());
  if (query) {
    params.set('q', query);
  }

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list Gmail messages');
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  if (messages.length === 0) {
    return [];
  }

  // Fetch metadata details for the messages in parallel
  const details = await Promise.allSettled(
    messages.slice(0, maxResults).map(async (msg: { id: string }) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!detailRes.ok) return null;
      const data = await detailRes.json();
      const headers = data.payload?.headers || [];

      const getHeader = (name: string) => {
        const found = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return found ? found.value : '';
      };

      return {
        id: data.id,
        threadId: data.threadId,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From') || '',
        to: getHeader('To') || '',
        date: getHeader('Date') || '',
        snippet: data.snippet || '',
      } as GmailMessageSummary;
    })
  );

  return details
    .filter((d): d is PromiseFulfilledResult<GmailMessageSummary> => d.status === 'fulfilled' && d.value !== null)
    .map((d) => d.value);
}

/**
 * Generate official HTML email template for Textile Presentation Competition 2026.
 */
export function generateRegistrationEmailHtml(params: {
  registrationId: string;
  submissionDate: string;
  formData: RegistrationFormData;
}): string {
  const { registrationId, submissionDate, formData } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Registration Voucher - Textile Presentation Competition 2026</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #F8FAF9; color: #0A192F; padding: 24px 12px; margin: 0;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <tr>
      <td style="background-color: #0A192F; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">TEXTILE PRESENTATION COMPETITION 2026</h1>
        <p style="margin: 6px 0 0 0; color: #22C55E; font-size: 13px; font-weight: bold; text-transform: uppercase;">Organized by Career Club BTEC</p>
        <p style="margin: 2px 0 0 0; color: #94A3B8; font-size: 11px;">Barishal Textile Engineering College</p>
      </td>
    </tr>

    <!-- Voucher Banner -->
    <tr>
      <td style="background-color: #F0FDF4; border-bottom: 1px solid #BBF7D0; padding: 16px 24px; text-align: center;">
        <span style="display: inline-block; background-color: #16A34A; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Official Registration Confirmation</span>
        <h2 style="margin: 10px 0 2px 0; font-size: 26px; color: #0A192F; font-family: monospace; letter-spacing: 1px;">${registrationId}</h2>
        <p style="margin: 0; font-size: 12px; color: #166534; font-weight: bold;">Submitted: ${submissionDate}</p>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
          Dear <strong>${formData.leader.name}</strong> and Team,
        </p>
        <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
          Congratulations! Your team registration for the <strong>Textile Presentation Competition 2026</strong> has been received by Career Club BTEC. Below are the confirmed registration details:
        </p>

        <!-- Event Schedule Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #0A192F; text-transform: uppercase;">Event Schedule & Venue</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #334155;"><strong>Date:</strong> 4 October 2026 (Sunday • 9:00 AM BST)</p>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #334155;"><strong>Venue:</strong> Auditorium, Barishal Textile Engineering College</p>
              <p style="margin: 0; font-size: 12px; color: #334155;"><strong>Reporting Time:</strong> 8:30 AM BST sharp</p>
            </td>
          </tr>
        </table>

        <!-- Team Breakdown -->
        <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #0A192F; text-transform: uppercase;">Registered Team Members</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 8px; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <tr style="background-color: #F1F5F9; text-align: left; font-weight: bold; color: #475569;">
            <th style="border: 1px solid #E2E8F0; padding: 8px;">Role</th>
            <th style="border: 1px solid #E2E8F0; padding: 8px;">Name</th>
            <th style="border: 1px solid #E2E8F0; padding: 8px;">Roll</th>
            <th style="border: 1px solid #E2E8F0; padding: 8px;">Department</th>
          </tr>
          <tr>
            <td style="border: 1px solid #E2E8F0; padding: 8px; font-weight: bold; color: #16A34A;">Leader</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.leader.name}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.leader.roll}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.leader.department}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #E2E8F0; padding: 8px; font-weight: bold; color: #475569;">Member 1</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.member1.name}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.member1.roll}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.member1.department}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #E2E8F0; padding: 8px; font-weight: bold; color: #475569;">Member 2</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.member2.name}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.member2.roll}</td>
            <td style="border: 1px solid #E2E8F0; padding: 8px;">${formData.member2.department}</td>
          </tr>
        </table>

        <!-- Payment Info -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF3C7; border-radius: 12px; border: 1px solid #FDE68A; margin-bottom: 24px;">
          <tr>
            <td style="padding: 14px 16px;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #92400E;">Payment Verification Status: PENDING</p>
              <p style="margin: 0; font-size: 11px; color: #78350F; line-height: 1.5;">
                bKash Number: <strong>${formData.payment.bkashNumber}</strong> | TrxID: <strong>${formData.payment.transactionId}</strong> (300 BDT).
                The finance committee will verify the transaction within 24 hours.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
          <em>Note: Anyone with this Registration Number (<strong>${registrationId}</strong>) can view or edit team information up to 3 times on the competition portal.</em>
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 24px; text-align: center; color: #94A3B8; font-size: 11px;">
        <p style="margin: 0 0 4px 0; font-weight: bold; color: #64748B;">Career Club BTEC • Barishal Textile Engineering College</p>
        <p style="margin: 0;">Email: careerclubbtec@gmail.com • Contact: +880 1700-000000</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
