import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@ts-template/core/db/schema';
import type { DB } from '@ts-template/core/util/database';
import app, { type AssetServer, type Env } from './server';
import './pages.gen';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 8790);
const HOSTNAME = process.env.HOST ?? '0.0.0.0';
const DATABASE_PATH = resolve(process.env.DATABASE_PATH ?? './data/ts-template.db');
const CLIENT_DIR = resolve(process.env.CLIENT_DIR ?? join(__dirname, '../dist/node-client'));

await mkdir(dirname(DATABASE_PATH), { recursive: true });
const client = createClient({ url: `file:${DATABASE_PATH}` });
const db: DB = drizzle(client, { schema });

const CONTENT_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

function contentType(path: string): string {
  const dot = path.lastIndexOf('.');
  return (dot >= 0 && CONTENT_TYPES.get(path.slice(dot).toLowerCase())) || 'application/octet-stream';
}

function createDiskAssets(clientDir: string): AssetServer {
  const root = normalize(clientDir);

  async function read(relPath: string): Promise<Uint8Array<ArrayBuffer> | null> {
    const target = normalize(join(root, relPath));
    if (target !== root && !target.startsWith(root + sep)) return null;
    try {
      const data = await readFile(target);
      const bytes = new Uint8Array(data.byteLength);
      bytes.set(data);
      return bytes;
    } catch {
      return null;
    }
  }

  return {
    async fetch(request: Request): Promise<Response> {
      const { pathname } = new URL(request.url);
      const rel = decodeURIComponent(pathname.endsWith('/') ? `${pathname}index.html` : pathname);
      const file = await read(rel);
      if (file) {
        return new Response(file, {
          headers: {
            'content-type': contentType(rel),
            'cache-control': rel.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
          },
        });
      }
      const shell = await read('/index.html');
      if (shell) return new Response(shell, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      return new Response('Asset not found. Did you run `pnpm build`?', { status: 404 });
    },
  };
}

const env: Env = { DB: db, ASSETS: createDiskAssets(CLIENT_DIR), APP_NAME: process.env.APP_NAME };

serve({ fetch: (request: Request) => app.fetch(request, env), port: PORT, hostname: HOSTNAME }, (info) => {
  console.log(`ts-template listening on http://${HOSTNAME}:${info.port} (db: ${DATABASE_PATH})`);
});
