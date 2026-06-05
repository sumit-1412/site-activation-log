# Go + MongoDB Backend (planned)

This folder is reserved for your Go API. The React frontend is already wired to call these endpoints when `VITE_API_URL` is set.

## Suggested stack

- **Go** — `chi` or `gin` router
- **MongoDB** — `activations` collection
- **Document shape** — matches `ActivationDocument` in `frontend/src/types/index.ts`

## Planned REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/activations/current` | Load active onboarding session |
| PUT | `/api/activations/current` | Save full state |
| POST | `/api/activations` | Create new activation |
| DELETE | `/api/activations/current` | Reset / clear |

## MongoDB document example

```json
{
  "_id": "ObjectId",
  "setupDone": true,
  "info": { "name": "XYZ Hospital", "city": "Gurugram", ... },
  "milestones": { "m1": { "status": "done", ... } },
  "docs": { "d1": { "status": "not-sent", ... } },
  "visits": [],
  "pocs": [],
  "nudgeLogs": [],
  "activity": [],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

## CORS

Allow `http://localhost:5173` during development.
