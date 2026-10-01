# 🎮 Semantic Game Matchmaker API

A REST API for searching video games using **natural-language semantic search**.  
It stores game metadata alongside **384-dimensional vector embeddings** of each game's description, enabling hybrid search that combines **pgvector cosine similarity** with traditional relational filters (price, genre).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL 16 + pgvector |
| Embeddings | Transformers.js (`Xenova/all-MiniLM-L6-v2`) — runs locally, no API key |
| Driver | `pg` (node-postgres) |

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

This launches a **pgvector/pgvector:pg16** container and auto-runs `init.sql` to create the schema.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if your database credentials differ
```

### 4. Start the server

```bash
npm run dev     # hot-reload via Node --watch
# or
npm start       # production
```

> ⏳ The first startup downloads the MiniLM model (~80 MB). Subsequent starts are instant.

## API Endpoints

### `POST /api/games/ingest`

Ingest a game into the database. The description is automatically embedded.

```bash
curl -X POST http://localhost:3000/api/games/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Elden Ring",
    "description": "An action RPG set in a vast open world full of dark fantasy lore, challenging combat, and deep exploration.",
    "price": 59.99,
    "genre": "RPG"
  }'
```

### `GET /api/search/semantic`

Search for games using natural language. Optionally filter by max price.

```bash
# Pure semantic search
curl "http://localhost:3000/api/search/semantic?q=dark+fantasy+with+sword+combat"

# Hybrid: semantic + price filter
curl "http://localhost:3000/api/search/semantic?q=space+exploration&max_price=30"
```

### `GET /api/games/:id/similar`

Find the top 5 games most similar to a given game (by embedding distance).

```bash
curl "http://localhost:3000/api/games/<uuid>/similar"
```

### `GET /health`

Health check endpoint.

## Project Structure

```
.
├── docker-compose.yml        # pgvector database container
├── init.sql                  # Database schema & indexes
├── package.json
├── .env.example
└── src/
    ├── server.js             # Express app entry point
    ├── db.js                 # PostgreSQL connection pool
    ├── services/
    │   └── embedding.js      # Singleton Transformers.js pipeline
    ├── controllers/
    │   ├── gameController.js # Ingest + similar-games logic
    │   └── searchController.js # Semantic search logic
    └── routes/
        ├── gameRoutes.js     # /api/games/*
        └── searchRoutes.js   # /api/search/*
```

## License

MIT
