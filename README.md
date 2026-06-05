# Humblx Site Activation Log

React + TypeScript + Tailwind frontend for hospital onboarding tracking. The original single-file `ops.html` prototype has been converted into a structured app ready for a **Go + MongoDB** backend.

## Project structure

```
client activation/
├── ops.html              # Original prototype (reference)
├── frontend/             # React + TypeScript + Tailwind (Vite)
│   └── src/
│       ├── pages/        # Route pages (Home, Timeline, Visits, …)
│       ├── routes/       # React Router config + path constants
│       └── layouts/      # Internal & client layouts
├── backend/              # Go API placeholder (you'll implement)
└── scripts/
    └── extract-data.mjs  # Re-extract phases/docs/templates from ops.html
```

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

## Quick start (frontend)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Data is stored in **localStorage** (`hx_sal_v4`) until you connect the Go API.

## Connect Go backend later

1. Implement REST endpoints under `backend/` (see `backend/README.md`).
2. Copy `frontend/.env.example` to `frontend/.env` and set:

   ```
   VITE_API_URL=http://localhost:8080/api
   ```

3. The Vite dev server proxies `/api` → `localhost:8080`.

The frontend API client lives in `frontend/src/api/client.ts` and mirrors the planned MongoDB document shape in `frontend/src/types/index.ts`.

## Re-sync static data from ops.html

If you edit `ops.html` milestones or templates:

```bash
node scripts/extract-data.mjs
```
