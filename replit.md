# RenderSync — AI Video Generator

A full-stack web app for submitting AI video generation jobs, tracking queue progress in real time, and managing job history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/video-gen run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, shadcn/ui, Framer Motion, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/jobs.ts` — Drizzle job table schema
- `artifacts/api-server/src/routes/jobs.ts` — job CRUD route handlers
- `artifacts/api-server/src/lib/queue-worker.ts` — background worker advancing job states
- `artifacts/video-gen/src/` — React frontend (pages: dashboard, job queue, job detail)

## Architecture decisions

- Queue worker runs in-process (setInterval, 3s tick) simulating AI video generation progress
- Jobs advance automatically: queued → processing → done, 20% progress per tick
- Frontend polls active jobs every 3 seconds via React Query `refetchInterval`
- File-based queue approach from original Python code translated to PostgreSQL-backed job table for reliability and query flexibility

## Product

- Submit AI video generation jobs with a text prompt, duration (seconds), and resolution
- Dashboard shows real-time active queue with progress bars and live stats
- Job history page lists all jobs filterable by status (queued, processing, done, failed, cancelled)
- Cancel queued jobs before they start processing
- Job detail page shows full parameters, progress, and status timeline

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any `lib/db/src/schema` change, run `pnpm run typecheck:libs` before checking artifact typechecks (stale lib declarations cause false TS2305 errors)
- After each OpenAPI spec change, re-run codegen before implementing routes or frontend hooks
- The queue worker starts automatically when the API server starts — no separate process needed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
