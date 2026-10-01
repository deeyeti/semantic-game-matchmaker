// ─────────────────────────────────────────────────────────
// routes/searchRoutes.js
// ─────────────────────────────────────────────────────────
const { Router } = require("express");
const { semanticSearch } = require("../controllers/searchController");

const router = Router();

// Semantic (+ hybrid) search
router.get("/semantic", semanticSearch);

module.exports = router;
