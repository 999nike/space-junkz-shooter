// ---- /api/getLeaderboard.js ----
import { sql } from './db.js';

export default async function handler(req, res) {
  try {
    const rows = await sql/*sql*/`
      SELECT players.name, stats.score, stats.coins, stats.xp
      FROM stats
      JOIN players ON stats.player_id = players.id
      ORDER BY stats.score DESC
      LIMIT 20;
    `;

    res.status(200).json({ ok: true, leaderboard: rows });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ ok: false });
  }
}
