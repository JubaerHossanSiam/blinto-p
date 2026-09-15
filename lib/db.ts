import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

export const databaseConfigured = Boolean(databaseUrl);

export const db = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl ? { rejectUnauthorized: false } : undefined,
  max: 5,
});
