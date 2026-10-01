// ─────────────────────────────────────────────────────────
// services/embedding.js — Singleton Transformers.js pipeline
// ─────────────────────────────────────────────────────────
// Uses @xenova/transformers to run the all-MiniLM-L6-v2 model
// entirely locally — no API key required.
// The pipeline is lazily initialised once, then reused.
// ─────────────────────────────────────────────────────────

let pipelineInstance = null;

/**
 * Returns (and caches) a feature-extraction pipeline.
 * The first call downloads / loads the model; subsequent calls are instant.
 */
async function getPipeline() {
  if (!pipelineInstance) {
    // Dynamic import because @xenova/transformers is ESM-only in newer versions
    const { pipeline } = await import("@xenova/transformers");
    console.log("⏳ Loading embedding model (Xenova/all-MiniLM-L6-v2)…");
    pipelineInstance = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("✅ Embedding model loaded.");
  }
  return pipelineInstance;
}

/**
 * Generate a 384-dimensional embedding for an arbitrary text string.
 * @param {string} text
 * @returns {Promise<number[]>} 384-element float array
 */
async function generateEmbedding(text) {
  const extractor = await getPipeline();
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  // output.data is a Float32Array; convert to a plain JS array for pg
  return Array.from(output.data);
}

module.exports = { generateEmbedding, getPipeline };
