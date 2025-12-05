// ---- DB HELPER: Neon Postgres connection -----------------
// Uses DATABASE_URL from Vercel env

import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set – check Vercel env vars');
}

export const sql = neon(process.env.DATABASE_URL);
