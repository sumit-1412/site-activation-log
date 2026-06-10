# Humblx Site Activation Log

React + TypeScript + Tailwind frontend with a **Go + MongoDB** backend.

## Data flow (API mode)

```
Browser → Vite (/api proxy) → Go API (:8080) → MongoDB (Atlas or local)
```

With `VITE_USE_API=true` in `frontend/.env`, the app **does not** use browser localStorage for saves.

## Quick start (recommended: your MongoDB URI + Go API)

### 1. Backend env

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` — set your `MONGODB_URI` (e.g. MongoDB Atlas) and `MONGODB_DB`.

### 2. Frontend env

```bash
cd frontend
cp .env.example .env   # VITE_USE_API=true
npm install
```

### 3. Run

**Terminal 1 — API**

```bash
cd backend
go run ./cmd/server
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 — check the browser console for `[activation] API mode → /api`.

## Docker

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### API container + your MongoDB (Atlas / external)

Uses `MONGODB_URI` from `backend/.env`:

```bash
docker compose up api --build
```

Then run the frontend locally (`npm run dev` in `frontend/`).

### API + local MongoDB in Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

This overrides `MONGODB_URI` to `mongodb://mongodb:27017` inside the stack.

## AWS (later)

The same `backend` Docker image can deploy to ECS, App Runner, or EC2. Typical setup:

| Piece | AWS option |
|-------|------------|
| API | ECS Fargate / App Runner / EC2 |
| MongoDB | MongoDB Atlas (current) or Amazon DocumentDB |
| Frontend | S3 + CloudFront or Amplify |

Build the frontend with your production API URL:

```bash
VITE_USE_API=true VITE_API_URL=https://api.yourdomain.com/api npm run build
```

Set `MONGODB_URI`, `MONGODB_DB`, and `CORS_ORIGINS` as environment variables on the API service (never commit secrets).

## Routes

| Path | Page |
|------|------|
| `/setup` | Onboarding setup |
| `/home` | Internal cockpit |
| `/timeline` | Milestone timeline |
| `/visits` | Visit log |
| `/docs` | Document tracker |
| `/nudge` | Client nudges |
| `/info` | Hospital settings |
| `/client` | Client-facing view |

## Project structure

```
client activation/
├── frontend/          # React app (Vite)
├── backend/           # Go API
├── docker-compose.yml           # API only → backend/.env MongoDB URI
├── docker-compose.local.yml     # Optional local MongoDB
└── scripts/extract-data.mjs
```

See [backend/README.md](backend/README.md) for API details.
