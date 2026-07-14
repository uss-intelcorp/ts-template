import { AuthSession } from '@ts-template/core/auth/session';
import type { User } from '@ts-template/core/user/index';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../server';

const SESSION_COOKIE = 'ts_template_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function isAssetRequest(c: Context): boolean {
  const { pathname } = new URL(c.req.url);
  return (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/@') ||
    pathname.startsWith('/src/') ||
    pathname === '/favicon.svg' ||
    pathname === '/vite.svg'
  );
}

function isSecureRequest(c: Context): boolean {
  return new URL(c.req.url).protocol === 'https:';
}

export const loadAuthenticatedUser: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    try {
      const user = await AuthSession.findUser(token);
      if (user) c.set('user', user);
    } catch {
      // Ignore malformed/stale cookies; protected routes will still require auth.
    }
  }

  await next();
};

export const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (isAssetRequest(c) || c.get('user')) return next();
  if (new URL(c.req.url).pathname.startsWith('/api/') && !c.req.header('X-Inertia')) {
    return c.json({ error: 'Unauthenticated' }, 401);
  }
  return c.redirect('/login', 303);
};

export const redirectIfAuthenticated: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (c.get('user')) return c.redirect('/', 303);
  await next();
};

export async function createSessionCookie(c: Context<{ Bindings: Env }>, user: User.Public): Promise<void> {
  const session = await AuthSession.create({ userId: user.id, ttlSeconds: SESSION_TTL_SECONDS });
  const expires = new Date(`${session.expiresAt.replace(' ', 'T')}Z`);

  setCookie(c, SESSION_COOKIE, session.token, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
    sameSite: 'Lax',
    secure: isSecureRequest(c),
    expires,
  });

  c.set('user', user);
}

export async function clearSessionCookie(c: Context<{ Bindings: Env }>): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    try {
      await AuthSession.destroy(token);
    } catch {
      // Cookie deletion should still happen even if the DB row is already gone.
    }
  }

  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}
