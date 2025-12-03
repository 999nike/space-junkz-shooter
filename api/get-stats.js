import { sql } from "./db.js";

export default async function handler(req, res) {
  try {
    const player_id = req.query.player_id;
    if (!player_id) {
      return res.status(400).json({ ok:false, error:"Missing player_id" });
    }

    const rows = await sql`
      SELECT coins, score, xp
      FROM stats
      WHERE player_id = ${player_id}
      LIMIT 1;
    `;

    return res.status(200).json({
      ok: true,
      stats: rows[0] || { coins: 0, score: 0, xp: 0 }
    });
  } catch (err) {
    return res.status(500).json({ ok:false, error:String(err) });
  }
}
