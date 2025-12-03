// ---- /api/get-stats.js --------------------------------
// Fetches stats for a given player_id from Postgres.

import { sql } from './db.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const playerId = req.query.player_id || req.query.playerId;

    if (!playerId) {
      res.status(400).json({ error: 'player_id missing' });
      return;
    }

    const rows = await sql/*sql*/`
      SELECT *
      FROM stats
      WHERE player_id = ${playerId}
      LIMIT 1;
    `;

    const stats = rows[0] || null;

    res.status(200).json({ ok: true, stats });
  } catch (err) {
    console.error('get-stats error:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
}
