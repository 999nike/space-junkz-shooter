// ---- /api/create-player.js --------------------------------
// Creates (or finds) a player by name, and ensures a stats row exists.
// Used by syncNewPlayer(name) in your game.

import { sql } from './db.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Parse JSON body safely
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body || '{}');
    } else if (!body) {
      body = {};
    }

    const rawName = (body.name || '').trim();

    if (!rawName) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Clamp name length
    const name = rawName.slice(0, 32);

    // Upsert player by name
    const players = await sql/*sql*/`
      INSERT INTO players (name)
      VALUES (${name})
      ON CONFLICT (name) DO UPDATE
      SET name = EXCLUDED.name
      RETURNING id, name, created_at;
    `;

    if (!players.length) {
      res.status(500).json({ error: 'Failed to create player' });
      return;
    }

    const player = players[0];

    // Ensure stats row exists for this player
    await sql/*sql*/`
      INSERT INTO stats (player_id)
      VALUES (${player.id})
      ON CONFLICT (player_id) DO NOTHING;
    `;

    // Debug only for you
    if (name === '999nike') {
      console.log('[create-player] 999nike playerId =', player.id);
    }

    // Response
    res.status(200).json({
      ok: true,
      playerId: player.id,
      name: player.name,
      createdAt: player.created_at
    });

  } catch (err) {
    console.error('Error in /api/create-player:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
