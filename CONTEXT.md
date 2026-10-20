# Project Context

> Source of truth for this hiring task. Read this before touching any file.
> The full task brief lives in [`task.md`](./task.md).

## 1. What This Is

Hiring assessment for **Associate Web Instructor**. Two deliverables:

1. **Part 1** — Full-stack *Project Submission & Review Dashboard* (this repo)
2. **Part 2** — 2 Bengali teaching videos (10–12 min each) recorded with OBS,
   facecam lower-right. Must pick **1 topic from Category 1** + **1 topic from
   Category 2** (two from same category = disqualification).

Repo must be **public before submission**. Videos must use **this project as
teaching material** — no separate demo project.

## 2. Current State

| Area | Path | Status |
| --- | --- | --- |
| Backend | `backend/` | Express + Prisma 8 modular API working. Auth (JWT RBAC), submissions (student submit + duplicate + rate limit), mentor list (server-side filter + pagination), PATCH status w/ transition rule, `/api/stats` aggregate. Seeded mentor/students. Smoke-tested. |
| Frontend | `frontend/` | Bare Next.js 16 App Router scaffold, Tailwind 4, ShadCN config present. |
| Task brief | `task.md` | Formatted. Complete. |

### Important version notes

- **Prisma 8 RC**: contract lives at `backend/src/prisma/contract.prisma`.
  After editing, run `npx prisma contract emit`. Client: `import { db } from "./src/prisma/db"`.
  See `backend/prisma-8.md`.
- **Next.js 16**: breaking changes vs. older knowledge. Consult
  `frontend/node_modules/next/dist/docs/` before writing App Router code.
- **Task requires Express.js** — current raw http server must be replaced with Express while keeping Prisma 8 client usage.

## 3. Stack (required by task)

- TypeScript everywhere
- Frontend: **Next.js (App Router) + TailwindCSS + ShadCN**
- Backend: **Express.js** (running on port from env, CORS for the frontend origin)
- Database: **PostgreSQL via Prisma ORM**
- Auth: **JWT-based RBAC** — roles `STUDENT` and `MENTOR`

## 4. Feature → Build Phases

Order lessons (auth first — everything depends on it):

1. **Auth** — Express: `POST /api/auth/signup` (student), `POST /api/auth/login`,
   JWT sign/verify middleware, seeded admin/mentor. Frontend: login + signup pages.
2. **Submission Portal (student)** — `POST /api/submissions`.
   - Zod validation (name, repo URL, live link, description)
   - Duplicate prevention (unique constraint on repo URL per user)
   - Rate limit (e.g. per-user in-memory token bucket / express-rate-limit)
   - Frontend: protected submission form with graceful inline errors
3. **Review Dashboard (mentor)** — mentor-only
   - `GET /api/submissions?page=&status=` — paginated, **server-side status filter**
   - `PATCH /api/submissions/:id/status` — approve/reject with ownership/role verification
   - `GET /api/stats` — aggregated counts (pending/approved/rejected/total)
   - Frontend: paginated ShadCN data table, filter tabs, stats cards
4. **Seed** — Prisma seed script creating one mentor + sample students

## 5. Part 2 Strategy — Build to Teach Every Topic

**All 8 video topics must stay teachable from this codebase until final topic
choice is locked.** Deliberate design hooks:

| Topic | Hook in this project |
| --- | --- |
| **1A** N+1 Query | Mentor table query joins `submissions + feedback + student user`; write one deliberate `include`-vs-loop example. Sidebar stats bug candidate made intentionally teachable. |
| **1B** Caching (Redis) | `/api/stats` aggregation is the real-world analogy the topic demands — keep it a distinct endpoint so "cache this hot read in front of Postgres" story is clean. |
| **1C** AuthN vs AuthZ (RBAC) | JWT middleware pipeline: token verify (AuthN) → role check (AuthZ). Student vs Mentor routes live in code — perfect diagram material. |
| **1D** Next.js Rendering | Submission form is a Client Component (interactivity), dashboard pages server-rendered. Comment which pages are RSC/client and why. |
| **2A** Securing a Route | `PATCH /api/submissions/:id/status` — extract user from JWT, verify role + status-transition validity before DB write. |
| **2B** Schema & Relations | Prisma contract: `User(1) → Submissions(1) → Feedback(1... )` one-to-many chain + mentor feedback. Write schema live-friendly, field names beginner-legible. |
| **2C** Data Fetching | Mentor dashboard: pagination + refetch on filter change, loading/error/swr-pattern coverage. Use SWR or TanStack Query (add if needed) to make invalidation demonstrable. |
| **2D** Defensive Validation | Shared Zod schema reused by backend route AND frontend form (single source of truth). Nice teaching moment. |

**Rule while coding Part 1:** every feature above stays visible, commented for
teaching in videos is OK — but keep production-quality, no fake/scaffolded code.

## 6. Conventions

- Backend: `backend/src/` — `index.ts` (bootstrap), `app.ts` (Express wiring), `config/`, `lib/` (auth/errors/validate), `middleware/` (rate-limit, error-handler), `modules/<module>/{route,controller,service,validation}.ts` — route wires middlewares, controller handles req/res, service holds business rules
- Validation layering: `validateBody` (body) + `parseOrThrow` (params/query) → Zod → `{ fieldErrors }` envelope surfaced by `errorHandler`
- Rate limiter: `middleware/rate-limit.ts` sliding window, keyed by userId/IP, starts timer sweep only on demand
- Frontend: `frontend/app/` (App Router), `components/`, `lib/`, `hooks/`
- Env vars documented in each `/.env.example`. Never commit secrets.
- Validation errors returned in a consistent `{ fieldErrors }` envelope — frontend consumes it directly (helps topic 2D).
- Server-side filtering + pagination — never client-side for the review dashboard.
- Zod schemas shared: backend is source of truth; frontend mirrors via a thin `lib/types.ts` if a monorepo symlink isn't practical.

## 7. Definition of Done (Part 1)

- [ ] Student can sign up, log in, submit project, see duplicate/rate-limit errors
- [ ] Mentor (seeded) can log in, see paginated table, filter by status server-side,
      approve/reject, see stats
- [ ] JWT RBAC enforced on every protected route
- [ ] `README.md` in each workspace: setup steps, port config, seed command
- [ ] `npm run build` / `tsc` clean in both workspaces
