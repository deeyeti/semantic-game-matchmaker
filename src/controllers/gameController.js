// ─────────────────────────────────────────────────────────
// controllers/gameController.js — Ingest & Similar-games logic
// ─────────────────────────────────────────────────────────
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { generateEmbedding } = require("../services/embedding");

/**
 * POST /api/games/ingest
 * Body: { title, description, price, genre }
 */
async function ingestGame(req, res, next) {
  try {
    const { title, description, price, genre } = req.body;

    // ── Validation ───────────────────────────────────────
    if (!title || !description || price == null || !genre) {
      return res.status(400).json({
        error: "Missing required fields: title, description, price, genre",
      });
    }

    // ── Generate embedding from the description ──────────
    const embedding = await generateEmbedding(description);
    const embeddingLiteral = `[${embedding.join(",")}]`;

    // ── Persist to PostgreSQL ────────────────────────────
    const id = uuidv4();
    const { rows } = await db.query(
      `INSERT INTO games (id, title, description, price, genre, embedding)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, description, price, genre, created_at`,
      [id, title, description, price, genre, embeddingLiteral]
    );

    return res.status(201).json({ game: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/games/:id/similar
 * Returns the top 5 most similar games (by embedding cosine distance).
 */
async function findSimilar(req, res, next) {
  try {
    const { id } = req.params;

    // ── Fetch the source game's embedding ────────────────
    const source = await db.query(
      "SELECT embedding FROM games WHERE id = $1",
      [id]
    );

    if (source.rows.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    // ── Find the 5 nearest neighbours (excl. self) ──────
    const { rows } = await db.query(
      `SELECT id, title, description, price, genre,
              1 - (embedding <=> $1::vector) AS similarity
       FROM   games
       WHERE  id != $2
       ORDER  BY embedding <=> $1::vector
       LIMIT  5`,
      [source.rows[0].embedding, id]
    );

    return res.json({ source_id: id, similar: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { ingestGame, findSimilar };
