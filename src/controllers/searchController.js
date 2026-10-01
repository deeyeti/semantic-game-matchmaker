// ─────────────────────────────────────────────────────────
// controllers/searchController.js — Semantic search endpoint
// ─────────────────────────────────────────────────────────
const db = require("../db");
const { generateEmbedding } = require("../services/embedding");

/**
 * GET /api/search/semantic?q=...&max_price=...
 * Converts the query text to a vector and performs a cosine-distance
 * search. Optionally filters by max_price (hybrid search).
 */
async function semanticSearch(req, res, next) {
  try {
    const { q, max_price } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query parameter `q` is required" });
    }

    // ── Embed the user's natural-language query ──────────
    const queryEmbedding = await generateEmbedding(q);
    const embeddingLiteral = `[${queryEmbedding.join(",")}]`;

    // ── Build parameterised SQL ──────────────────────────
    let sql = `
      SELECT id, title, description, price, genre,
             1 - (embedding <=> $1::vector) AS similarity
      FROM   games
    `;
    const params = [embeddingLiteral];

    if (max_price != null && max_price !== "") {
      sql += ` WHERE price <= $2`;
      params.push(Number(max_price));
    }

    sql += ` ORDER BY embedding <=> $1::vector LIMIT 5`;

    const { rows } = await db.query(sql, params);
    return res.json({ query: q, results: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { semanticSearch };
