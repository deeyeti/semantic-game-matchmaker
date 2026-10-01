-- ============================================================
-- Semantic Game Matchmaker — Database Initialisation
-- ============================================================
-- Run once against the target PostgreSQL database:
--   psql -U postgres -d gamedb -f init.sql
-- ============================================================

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create the games table
CREATE TABLE IF NOT EXISTS games (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255)  NOT NULL,
    description TEXT          NOT NULL,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    genre       VARCHAR(100)  NOT NULL,
    embedding   VECTOR(384),                -- Xenova/all-MiniLM-L6-v2 output dim
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. Create an IVFFlat index for fast cosine-distance searches
--    (requires at least one row to exist before building, but
--     CREATE INDEX IF NOT EXISTS is safe to run early)
CREATE INDEX IF NOT EXISTS idx_games_embedding
    ON games
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- 5. Conventional B-tree indexes for relational filters
CREATE INDEX IF NOT EXISTS idx_games_genre ON games (genre);
CREATE INDEX IF NOT EXISTS idx_games_price ON games (price);
