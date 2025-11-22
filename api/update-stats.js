// ---- /api/update-stats.js --------------------------------
// Updates stats for a player_id in Postgres (coins, score, xp).

import { sql } from './db.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body) body = {};

    const { player_id, coins, score, xp } = body;

    if (!player_id) {
      res.status(400).json({ error: 'player_id missing' });
      return;
    }

    const result = await sql/*sql*/`
      INSERT INTO stats (player_id, coins, score, xp)
      VALUES (
        ${player_id},
        ${coins ?? 0},
        ${score ?? 0},
        ${xp ?? 0}
      )
      ON CONFLICT (player_id)
      DO UPDATE SET
        coins = EXCLUDED.coins,
        score = EXCLUDED.score,
        xp = EXCLUDED.xp,
        updated_at = NOW()
      RETURNING *;
    `;

    res.status(200).json({
      ok: true,
      stats: result[0]
    });

  } catch (err) {
    console.error("update-stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
