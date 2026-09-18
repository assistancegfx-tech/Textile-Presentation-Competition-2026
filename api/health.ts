import type { IncomingMessage, ServerResponse } from 'http';

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default function handler(req: IncomingMessage, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    service: 'Textile Presentation Competition 2026 API',
    timestamp: new Date().toISOString()
  });
}
