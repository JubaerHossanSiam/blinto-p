import net from 'node:net';
import { Pool } from 'pg';

// Node gives each resolved address 250ms to connect before moving to the next
// one (Happy Eyeballs). The Neon endpoint's TCP handshake takes longer than
// that from here, so every address was aborted mid-handshake and pg surfaced
// the result as an ETIMEDOUT AggregateError.
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

const databaseUrl = process.env.DATABASE_URL;

export const databaseConfigured = Boolean(databaseUrl);

export const db = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl ? { rejectUnauthorized: false } : undefined,
  // Pages fan out wider than five queries at a time (the portal dashboard and
  // the profile pages both do), and better-auth shares this pool. At max: 5
  // the overflow queued inside pg and read as slow queries when it was really
  // connection wait. Neon's pooler fronts the database, so a larger client
  // pool is cheap.
  max: 15,
  // Without these a single hung query holds a slot forever.
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  statement_timeout: 20_000,
});
