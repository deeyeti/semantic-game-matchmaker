// ─────────────────────────────────────────────────────────
// server.js — Application entry point
// ─────────────────────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const gameRoutes = require("./routes/gameRoutes");
const searchRoutes = require("./routes/searchRoutes");
const { getPipeline } = require("./services/embedding");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────
app.use("/api/games", gameRoutes);
app.use("/api/search", searchRoutes);

// ── Global error handler ────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Boot sequence ────────────────────────────────────────
async function start() {
  // Eagerly warm the embedding model so the first request isn't slow
  console.log("🚀 Warming up the embedding model…");
  await getPipeline();

  app.listen(PORT, () => {
    console.log(`\n🎮 Semantic Game Matchmaker API listening on http://localhost:${PORT}`);
    console.log(`   POST  /api/games/ingest`);
    console.log(`   GET   /api/search/semantic?q=...&max_price=...`);
    console.log(`   GET   /api/games/:id/similar\n`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
