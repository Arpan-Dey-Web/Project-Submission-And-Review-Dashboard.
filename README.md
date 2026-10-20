# Project Submission & Review Dashboard

Full-stack dashboard where students submit projects and mentors review them — built for the Associate Web Instructor assessment. Also used as the teaching material for the two recorded videos.

| Workspace | Stack | Port |
| --- | --- | --- |
| [`backend/`](./backend/README.md) | Express 5 + Prisma 8 (PostgreSQL) + JWT RBAC + Zod | `5000` |
| [`frontend/`](./frontend/README.md) | Next.js 16 App Router + Tailwind 4 + ShadCN + SWR | `3000` |

## Features

- **Auth** — student signup, universal login, JWT sessions with `STUDENT` / `MENTOR` roles
- **Student portal** — submit project (name, repo URL, live link, description), live field-level validation, duplicate-repo protection (`409`), per-user rate limiting (`429`)
- **Mentor dashboard** — stat cards, server-side status filter tabs, paginated submissions table, approve/reject with feedback (single transitions only: `PENDING → APPROVED/REJECTED`)
- **Stats endpoint** — `GET /api/stats` aggregate (total / pending / approved / rejected)
- **Consistent error envelope** — `{ error, fieldErrors }` shared by backend Zod validation and surfaced inline in frontend forms

## Quick start

```bash
# 1. Backend (runs migrations/seed check on boot)
cd backend
npm install
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, CORS_ORIGIN
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                 # http://localhost:3000
```

Seeded demo accounts (created automatically on backend boot):

| Role | Email | Password |
| --- | --- | --- |
| Mentor | `mentor@demo.io` | `password123` |
| Student | `tisha@demo.io` | `password123` |
| Student | `rifat@demo.io` | `password123` |

## Scripts

```bash
cd backend  && npm run typecheck   # tsc --noEmit
cd frontend && npm run typecheck   # tsc --noEmit
cd frontend && npm run build       # production build
```

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for API reference, environment variables, and the Prisma 8 contract workflow.
