// ─────────────────────────────────────────────────────────
// db.js — PostgreSQL connection pool (singleton)
// ─────────────────────────────────────────────────────────
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Surface unexpected errors instead of crashing silently
pool.on("error", (err) => {
  console.error("⚠  Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

/**
 * Convenience wrapper — accepts the same args as pool.query().
 * Usage:  const { rows } = await db.query("SELECT ...", [param]);
 */
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
