# frontend

Project Submission & Review Dashboard — Next.js 16 (App Router) + TailwindCSS 4 + ShadCN.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- TailwindCSS 4, ShadCN (base-nova / base-ui primitives)
- SWR for data fetching (mentor dashboard + student list, refetch on filter change)
- Zod schemas mirrored from the backend (`lib/validation.ts`) for client-side inline errors

## Setup

```bash
npm install
cp .env.example .env.local      # point NEXT_PUBLIC_API_URL at the backend
npm run dev                     # http://localhost:3000
```

Requires the backend running (default `http://localhost:4000`). See `../backend/README.md`
for seed accounts; CORS in the backend already allows this origin.

## Scripts

```bash
npm run dev        # next dev (turbopack)
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Pages

| Path | Role | Rendering |
| --- | --- | --- |
| `/` | public | server component, static |
| `/login`, `/signup` | public | server shells, client form |
| `/submit` | STUDENT | client, guarded, submission form + own submissions |
| `/review` | MENTOR | client, guarded, stats cards + filter tabs + paginated table |

Auth session (JWT + user) lives in `localStorage` under `psr.session`
(`lib/session.ts`); route guards redirect per role in `components/role-guard.tsx`.

API calls go through `lib/api.ts` — single fetch wrapper that attaches the Bearer
token and surfaces the backend `{ error, fieldErrors }` envelope as `ApiError`
consumed by the forms for inline validation messages.
