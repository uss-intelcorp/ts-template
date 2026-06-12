# Repository Instructions

This is a private TypeScript application template, not a product app.

- Keep changes generic and reusable.
- Do not add app-specific secrets, production URLs, product names, or domain assumptions.
- Preserve the package split: `core` for domain/schema, `web` for Hono/Inertia/React, `cron` for Node workers.
- Keep Node/VPS, PM2, and Cloudflare Workers as supported targets.
- Prefer small starter examples over full business features.
- Validate with `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
