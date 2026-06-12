import type { MiddlewareHandler } from 'hono';
import type { Env } from '../server';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const basicAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const expectedUser = c.env.DASHBOARD_USER;
  const expectedPass = c.env.DASHBOARD_PASSWORD;
  if (!expectedUser || !expectedPass) return c.json({ error: 'Dashboard credentials are not configured.' }, 503);

  const header = c.req.header('Authorization');
  if (!header?.startsWith('Basic ')) {
    return c.text('Authentication required', 401, { 'WWW-Authenticate': 'Basic realm="ts-template"' });
  }

  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length).trim());
  } catch {
    return c.text('Malformed credentials', 400);
  }

  const sep = decoded.indexOf(':');
  if (sep === -1) return c.text('Malformed credentials', 400);

  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);
  if (!timingSafeEqual(user, expectedUser) || !timingSafeEqual(pass, expectedPass)) {
    return c.text('Invalid credentials', 401, { 'WWW-Authenticate': 'Basic realm="ts-template"' });
  }

  c.set('user', user);
  await next();
};
