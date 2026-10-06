import type { IncomingMessage, ServerResponse } from 'http';
import { registrationsStore } from '../_storage';

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

const DEFAULT_OFFICIAL_TEAMS = [
  'Nemesis',
  'Think Tankers',
  'Grean Weavers',
  'TRIWEAR',
  'Sugar Gliders',
  'Eco Warriors',
  'TITAN'
];

export default async function handler(req: IncomingMessage, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const extracted: string[] = [];

    // From in-memory store
    for (const r of registrationsStore) {
      const name = r.payload?.teamName || (r as any).teamName;
      if (name && typeof name === 'string' && !extracted.includes(name.trim())) {
        extracted.push(name.trim());
      }
    }

    // Ensure all 7 official teams are present in order
    for (const official of DEFAULT_OFFICIAL_TEAMS) {
      if (!extracted.includes(official)) {
        extracted.push(official);
      }
    }

    const teams = extracted.map((name, idx) => ({
      index: idx + 1,
      id: String(idx + 1).padStart(2, '0'),
      teamName: name,
      category: 'Presentation',
      status: 'Confirmed'
    }));

    return res.status(200).json({
      success: true,
      total: teams.length,
      teams
    });
  } catch (err: any) {
    const fallback = DEFAULT_OFFICIAL_TEAMS.map((name, idx) => ({
      index: idx + 1,
      id: String(idx + 1).padStart(2, '0'),
      teamName: name,
      category: 'Presentation',
      status: 'Confirmed'
    }));
    return res.status(200).json({
      success: true,
      total: fallback.length,
      teams: fallback
    });
  }
}
