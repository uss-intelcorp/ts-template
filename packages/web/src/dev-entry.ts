import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import type { ViteDevServer } from 'vite';
import * as schema from '@ts-template/core/db/schema';
import app, { type AssetServer, type Env } from './server';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

try {
  process.loadEnvFile(resolve(ROOT, '.dev.vars'));
} catch {
  /* rely on ambient env */
}

const DATABASE_PATH = resolve(process.env.DATABASE_PATH ?? './data/ts-template.db');
mkdirSync(dirname(DATABASE_PATH), { recursive: true });
const db = drizzle(createClient({ url: `file:${DATABASE_PATH}` }), { schema });

function viteShell(vite: ViteDevServer): AssetServer {
  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const template = await readFile(resolve(ROOT, 'index.html'), 'utf8');
      const html = await vite.transformIndexHtml(url.pathname, template);
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    },
  };
}

export default {
  fetch(request: Request, platformEnv: { vite: ViteDevServer }): Response | Promise<Response> {
    const env = { ...process.env, ...platformEnv, DB: db, ASSETS: viteShell(platformEnv.vite) } as unknown as Env;
    return app.fetch(request, env);
  },
};
