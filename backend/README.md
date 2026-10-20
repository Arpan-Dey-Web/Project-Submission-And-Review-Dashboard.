# backend

Project Submission & Review Dashboard API — Express + Prisma 8 (PostgreSQL).

## Stack

- Express 5 (ESM), TypeScript
- Prisma 8 RC — contract-based. Source of truth: `src/prisma/contract.prisma`
- JWT auth with RBAC (`STUDENT` / `MENTOR`)
- Zod validation, shared `{ fieldErrors }` error envelope
- In-memory sliding-window rate limiter

## Setup

```bash
npm install
cp .env.example .env        # then edit DATABASE_URL / JWT_SECRET
```

Start a local PostgreSQL 15+ (Docker shown):

```bash
docker run -d --name pg-dashboard \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=dashboard -p 5432:5432 postgres:16-alpine
```

Create/update tables from the contract (needs DATABASE_URL in env or `.env`):

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dashboard" npx prisma db init
```

## Run

```bash
npm run dev        # tsx watch, seeds 1 mentor + 2 students on boot
npm run typecheck  # tsc --noEmit
```

## Seeded accounts (password: `password123`)

| Email | Role |
| --- | --- |
| mentor@demo.io | MENTOR |
| tisha@demo.io | STUDENT |
| rifat@demo.io | STUDENT |

## API

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | public | student signup; rate limited by IP |
| POST | `/api/auth/login` | public | rate limited by IP |
| GET | `/api/health` | public | |
| POST | `/api/submissions` | STUDENT | 5 per 10 min per user |
| GET | `/api/submissions/mine` | any | student's own list |
| GET | `/api/submissions?status=&page=&pageSize=` | MENTOR | server-side filter + pagination |
| PATCH | `/api/submissions/:id/status` | MENTOR | PENDING → APPROVED/REJECTED only |
| GET | `/api/stats` | any | grouped aggregate counts |

## Errors

All validation/business errors use the same envelope:

```json
{ "error": "Validation failed", "fieldErrors": { "repoUrl": ["…"] } }
```

## Prisma 8 notes

- Edit `src/prisma/contract.prisma`, then `npx prisma contract emit`
- Client: `import { db } from "./src/prisma/db"` (loads `.env` via `process.loadEnvFile`)
- CLI commands read `DATABASE_URL` from `process.env` directly (`prisma.config.ts`),
  so pass it inline if `.env` isn't picked up

## Frontend port

Frontend runs on 3000 and is the default CORS origin (`CORS_ORIGIN` in `.env`).
Backend listens on **4000** (`PORT` in `.env`).
