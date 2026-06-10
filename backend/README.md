# Humblx Site Activation Log — Go API

REST API backed by MongoDB. Matches `frontend/src/api/client.ts`.

## Stack

- **Go 1.22** + [chi](https://github.com/go-chi/chi)
- **MongoDB** — `humblx_activation.activations` collection

## Environment (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP port |
| `MONGODB_URI` | `mongodb://localhost:27017` | Your MongoDB connection string |
| `MONGODB_DB` | `humblx_activation` | Database name |
| `CORS_ORIGINS` | `https://site-activation-log.vercel.app,http://localhost:5173,...` | Comma-separated allowed origins |

Copy `backend/.env.example` → `backend/.env` and paste your Atlas (or other) URI.

## Run locally (no Docker)

```bash
cd backend
go run ./cmd/server
```

- Health: http://localhost:8080/api/health
- Frontend: set `VITE_USE_API=true` in `frontend/.env`, then `npm run dev`

## Run with Docker

**Your MongoDB URI (Atlas)** — from project root:

```bash
docker compose up api --build
```

**Local MongoDB in Docker**:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/activations/current` | Load current activation (404 if none) |
| PUT | `/api/activations/current` | Create or update current activation |
| DELETE | `/api/activations/current` | Delete current activation |
| POST | `/api/activations` | Create new activation (becomes current) |
| GET | `/api/activations/{id}` | Load by MongoDB ObjectId |

## Deploy on Render

**Error `./app: No such file or directory`** means the start command ran but the build did not produce `app` (wrong root dir or failed build).

In Render → your Web Service → **Settings**:

| Field | Value |
|-------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `go build -o app ./cmd/server` |
| **Start Command** | `./app` |

**Environment variables** (Render → Environment):

```
PORT=8080
GO_VERSION=1.22.12
MONGODB_URI=your-atlas-uri
MONGODB_DB=humblx_activation
CORS_ORIGINS=https://site-activation-log.vercel.app,http://localhost:5173
GOOGLE_CLIENT_ID=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Or use the repo’s `render.yaml` Blueprint from the project root.

After deploy, test `https://YOUR-SERVICE.onrender.com/api/health`, then set Vercel `VITE_API_URL=https://YOUR-SERVICE.onrender.com/api`.

## AWS deployment notes

- Build: `docker build -t site-activation-api ./backend`
- Inject `MONGODB_URI`, `MONGODB_DB`, `CORS_ORIGINS` at runtime (Secrets Manager / task env)
- Point `CORS_ORIGINS` at your production frontend URL
- Atlas IP allowlist: add your ECS/NAT egress IP or use `0.0.0.0/0` for dev only

## Project layout

```
backend/
├── cmd/server/main.go
├── internal/config/
├── internal/handlers/
├── internal/models/
├── internal/store/
├── Dockerfile
└── go.mod
```
