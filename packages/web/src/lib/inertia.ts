import { serializePage, type RootView } from '@hono/inertia';
import type { Context } from 'hono';
import type { Env } from '../server';

export const ASSET_VERSION = '1';

declare module 'hono' {
  interface ContextVariableMap {
    user: string;
    flash: Record<string, unknown>;
  }
}

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const rootView: RootView = async (page, c: Context) => {
  const env = c.env as Env;
  const shellReq = new Request(new URL('/index.html', c.req.url).toString(), { headers: { Accept: 'text/html' } });
  const shellResp = await env.ASSETS.fetch(shellReq);
  if (!shellResp.ok) return `Failed to load app shell (${shellResp.status}).`;
  const html = await shellResp.text();
  return html.replace('data-page="__INERTIA_PAGE__"', `data-page="${escapeHtmlAttr(serializePage(page))}"`);
};

export function sharedProps(c: Context<{ Bindings: Env }>): {
  flash: Record<string, unknown>;
  auth: { user: string | null };
  app: { name: string };
} {
  return {
    flash: c.get('flash') ?? {},
    auth: { user: c.get('user') ?? null },
    app: { name: c.env.APP_NAME ?? 'TS Template' },
  };
}
