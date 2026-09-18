import type { IncomingMessage, ServerResponse } from 'http';

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

    const { scriptUrl } = body || {};
    const targetUrl = scriptUrl || process.env.GOOGLE_SCRIPT_URL;

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'No Google Apps Script URL provided.'
      });
    }

    const getRes = await fetch(targetUrl, { redirect: 'follow' });
    const getText = await getRes.text();

    if (getText.includes('unable to open the file') || getText.includes('Page not found') || getRes.status === 404) {
      return res.status(200).json({
        success: false,
        error: 'Google error: "Unable to open the file at present". Authorize the script in Apps Script editor: select "setup" from toolbar dropdown, click "▶ Run", and approve permissions.'
      });
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(getText);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Google Apps Script connected successfully!',
      scriptStatus: parsed?.status || 'ok'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Connection test failed.'
    });
  }
}
