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
  // Establishing a connection from here to the us-east-1 endpoint is slow and
  // erratic — measured at 1.5s typical, but spiking past 25s — so a 10s cap
  // threw "timeout exceeded when trying to connect" on ordinary page loads.
  connectionTimeoutMillis: 30_000,
  // `min` is the floor the idle reaper will not go below, so a couple of
  // established connections survive between requests. Without it every page
  // load after a 30s pause paid the full handshake again; with it the common
  // path is a warm socket and the query's own ~250ms round trip.
  min: 2,
  idleTimeoutMillis: 30_000,
  // Neon hangs up on connections it considers idle, and its compute suspends
  // after about five minutes. Retiring a connection at four beats the server
  // to it, so a request is never handed a socket the far end has already
  // closed. Only matters because `min` keeps connections alive at all.
  maxLifetimeSeconds: 240,
  // Without this a single hung query holds a slot forever.
  statement_timeout: 20_000,
});

// A pooled connection can die while it sits idle — Neon closing it, a laptop
// suspending, the network dropping. pg reports that on the pool itself, and an
// EventEmitter with no 'error' listener rethrows, which took down the whole dev
// server with an uncaught "Connection terminated unexpectedly". pg has already
// discarded the client by this point, so there is nothing to repair: the next
// caller gets a fresh connection.
db.on('error', (error) => {
  console.warn('[db] idle connection dropped:', error.message);
});
