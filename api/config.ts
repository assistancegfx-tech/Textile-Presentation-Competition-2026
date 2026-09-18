import type { IncomingMessage, ServerResponse } from 'http';

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default function handler(req: IncomingMessage, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  const envUrl = process.env.GOOGLE_SCRIPT_URL || process.env.VITE_GOOGLE_SCRIPT_URL;
  const hasEnvScript = !!envUrl && envUrl.startsWith('http');
  return res.status(200).json({
    hasGoogleScript: hasEnvScript,
    configuredUrl: hasEnvScript ? 'Configured via Environment Variable' : null
  });
}
