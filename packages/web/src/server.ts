import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { inertia } from '@hono/inertia';
import { z } from 'zod';
import { Database, type DB } from '@ts-template/core/util/database';
import { Health } from '@ts-template/core/health/index';
import type { QueueJob } from '@ts-template/core/queue/job';
import { loadAuthenticatedUser, requireAuth } from './lib/auth';
import { ASSET_VERSION, rootView, sharedProps } from './lib/inertia';
import { authRoute } from './routes/auth';
import { healthRoute } from './routes/health';
import { settingsRoute } from './routes/settings';

export interface AssetServer {
  fetch(request: Request): Response | Promise<Response>;
}

export interface Env {
  DB: DB;
  ASSETS: AssetServer;
  JOB_QUEUE?: Queue<QueueJob>;
  APP_NAME?: string;
}

const app = new Hono<{ Bindings: Env }>()
  .use('*', logger())
  .use('*', (c, next) => Database.provide(c.env.DB, next))
  .use('*', loadAuthenticatedUser)
  .get('/api/health', (c) => c.json({ ...Health.status(), app: c.env.APP_NAME ?? 'TS Template' }))
  .use('*', inertia({ version: ASSET_VERSION, rootView }))
  .route('/', authRoute)
  .use('*', requireAuth)
  .route('/', settingsRoute)
  .route('/api', healthRoute)
  .get('/', async (c) => {
    const status = Health.status();
    const recentChecks = await Health.recent(20);
    return c.render('Dashboard', { ...sharedProps(c), status, recentChecks });
  })
  .all('*', async (c) => c.env.ASSETS.fetch(c.req.raw));

app.notFound((c) => c.text('Not found', 404));

app.onError((err, c) => {
  if (err instanceof z.ZodError) return c.json({ error: 'Invalid payload', issues: err.issues }, 400);
  console.error('Unhandled error:', err);
  return c.text('Internal Server Error', 500);
});

export default app;
