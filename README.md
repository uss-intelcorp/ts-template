# ts-template

Local sibling template for the TypeScript application pattern used by `ss-scraper` and `neo-scrapper`.

## Included Patterns

- pnpm workspace with `core`, `web`, and `cron` packages.
- Strict TypeScript config shared from the root.
- Drizzle schema in `core`, with a barrel at `@ts-template/core/db/schema`.
- Driver-agnostic DB access through `Database.provide(...)` and `Database.use(...)`.
- Zod-backed namespace functions using the `fn(schema, callback)` helper.
- Hono server composed as one chained expression for Inertia type inference.
- Inertia + React pages with `@hono/inertia/vite` page generation.
- Vite target split: Node/VPS by default, Cloudflare Workers with `dev:cf` / `build:cf`.
- Node entry serving built client assets from disk.
- Cloudflare Worker entry adapting D1 + Assets bindings.
- Portable queue architecture: SQLite queue worker locally, Cloudflare Queues on Workers.
- PM2 ecosystem file for web + cron processes.
- Local libSQL/SQLite migration runner with `applied_migrations` bookkeeping.

## Layout

```text
packages/
  core/      domain modules, Drizzle tables, migrations, shared DB helpers
  web/       Hono + Inertia + React app, Node/Worker entrypoints
  cron/      Node cron process sharing core/domain code
```

## Start A New App From This Template

If this repository is hosted on GitHub, keep it private and enable **Settings -> General -> Template repository**.

```bash
cp -a ../ts-template ../my-new-app
cd ../my-new-app
pnpm install
cp packages/web/.dev.vars.example packages/web/.dev.vars
pnpm db:migrate:node
pnpm dev
```

The dev server runs with Vite and the Hono Node adapter. The production Node entry defaults to port `8790`.

GitHub options:

```bash
gh repo create OWNER/my-new-app --private --template OWNER/ts-template
```

You can also run the **Template Archive** workflow to download a private `.tar.gz` artifact without cloning the repo directly.

## Commands

```bash
pnpm dev              # Vite + Hono Node dev server
pnpm build            # typecheck + build client bundle for Node
pnpm serve            # run built app with Node
pnpm db:migrate:node  # apply local SQLite migrations
pnpm cron             # run heartbeat cron process
pnpm queue            # run local SQLite queue worker
pnpm typecheck
pnpm lint
```

## PM2

```bash
pnpm build
pnpm db:migrate:node
pnpm pm2:start
pm2 save
```

The ecosystem config starts:

- `ts-template-web` on `PORT=8790` by default.
- `ts-template-cron`, a heartbeat job every 5 minutes by default.
- `ts-template-queue`, a SQLite polling worker for local/VPS jobs.

Override `PORT`, `DATABASE_PATH`, `APP_NAME`, `HEARTBEAT_CRON`, `QUEUE_NAME`, `QUEUE_POLL_MS`, or `QUEUE_RESERVATION_SECONDS` in the environment or `packages/web/.dev.vars`.

## Queue Architecture

The template stubs a Laravel-style queue pattern without tying domain code to a single runtime.

Core pieces:

- `packages/core/src/queue/job.ts`: typed zod job union.
- `packages/core/src/queue/handlers.ts`: handler registry. Add new job handlers here.
- `packages/core/src/queue/queue.sql.ts`: SQLite/D1 tables for local jobs and failed jobs.
- `packages/core/src/queue/sqlite.ts`: local SQLite queue dispatcher and worker helpers.
- `packages/core/src/queue/cloudflare.ts`: producer adapter for Cloudflare Queue bindings.

Runtime behavior:

- Node/PM2: `POST /api/health-checks/queued` writes to `queue_jobs`; `ts-template-queue` polls and runs handlers.
- Cloudflare: the same route sends to `JOB_QUEUE`; `src/index.ts` exports a `queue(batch, env, ctx)` consumer that runs the same `core` handlers.
- Both drivers are at-least-once. Keep job handlers idempotent and use `idempotencyKey` when dispatching durable one-off work.

The starter job is `health.record`, which records a row in `health_checks`. Replace it with app-specific jobs by extending the union in `queue/job.ts` and the switch in `queue/handlers.ts`.

## Cloudflare Workers

The Worker path is stubbed but ready:

```bash
pnpm --filter @ts-template/web exec wrangler d1 create ts-template
pnpm --filter @ts-template/web exec wrangler queues create ts-template-jobs
pnpm db:migrate:remote
pnpm --filter @ts-template/web build:cf
pnpm --filter @ts-template/web deploy:cf
```

Update the `database_id` in `packages/web/wrangler.toml` after creating the D1 database.

## Replace The Starter Domain

The starter domain module is `core/src/health`. For a real app:

- Add a new `packages/core/src/<domain>/<domain>.sql.ts` table file.
- Re-export it from `packages/core/src/db/schema.ts`.
- Add namespace functions in `packages/core/src/<domain>/index.ts`.
- Add routes in `packages/web/src/routes` and page components in `packages/web/src/pages`.
- Generate a migration with `pnpm db:generate`, or add a small hand-written migration for seed data.
