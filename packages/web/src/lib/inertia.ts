import { serializePage, type RootView } from '@hono/inertia';
import type { Context } from 'hono';
import type { User } from '@ts-template/core/user/index';
import type { Env } from '../server';

export const ASSET_VERSION = '1';

declare module 'hono' {
  interface ContextVariableMap {
    user: User.Public;
  }
}

export interface SharedProps {
  auth: { user: User.Public | null };
  app: { name: string };
}

export const rootView: RootView = async (page, c: Context) => {
  const env: Env = c.env;
  const shellReq = new Request(new URL('/index.html', c.req.url).toString(), { headers: { Accept: 'text/html' } });
  const shellResp = await env.ASSETS.fetch(shellReq);
  if (!shellResp.ok) return `Failed to load app shell (${shellResp.status}).`;
  const html = await shellResp.text();
  const json = serializePage(page).replace(/</g, '\\u003c');
  return html.replace('__INERTIA_PAGE__', () => json);
};

export function sharedProps(c: Context<{ Bindings: Env }>): SharedProps {
  return {
    auth: { user: c.get('user') ?? null },
    app: { name: c.env.APP_NAME ?? 'TS Template' },
  };
}
