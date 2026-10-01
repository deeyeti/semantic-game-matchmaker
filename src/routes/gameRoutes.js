// ─────────────────────────────────────────────────────────
// routes/gameRoutes.js
// ─────────────────────────────────────────────────────────
const { Router } = require("express");
const { ingestGame, findSimilar } = require("../controllers/gameController");

const router = Router();

// Ingest a new game (generates embedding + stores)
router.post("/ingest", ingestGame);

// Find games similar to the given game ID
router.get("/:id/similar", findSimilar);

module.exports = router;
