import { sql } from "./db.js";
export default async function handler(req, res) {
  const id = req.query.player_id;
  if (!id) return res.status(400).json({ok:false});
  const rows = await sql`select coins, score, xp from stats where player_id=${id} limit 1;`;
  res.status(200).json({ ok:true, stats: rows[0] || {coins:0,score:0,xp:0} });
}
