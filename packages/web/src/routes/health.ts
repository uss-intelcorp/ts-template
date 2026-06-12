import { Hono } from 'hono';
import { Health } from '@ts-template/core/health/index';
import { CloudflareQueue } from '@ts-template/core/queue/cloudflare';
import { SQLiteQueue } from '@ts-template/core/queue/sqlite';
import type { QueueJob } from '@ts-template/core/queue/job';
import type { Env } from '../server';
import { zValidator } from '../lib/validator';

async function dispatchJob(env: Env, job: QueueJob): Promise<'cloudflare' | 'sqlite'> {
  if (env.JOB_QUEUE) {
    await CloudflareQueue.dispatch(env.JOB_QUEUE, job);
    return 'cloudflare';
  }
  await SQLiteQueue.dispatch({ job });
  return 'sqlite';
}

export const healthRoute = new Hono<{ Bindings: Env }>()
  .get('/health-checks', async (c) => c.json({ items: await Health.recent(20) }))
  .post('/health-checks', zValidator('json', Health.RecordInput), async (c) => {
    const rows = await Health.record(c.req.valid('json'));
    if (c.req.header('X-Inertia')) return c.redirect('/', 303);
    return c.json({ ok: true, item: rows[0] ?? null });
  })
  .post('/health-checks/queued', zValidator('json', Health.RecordInput), async (c) => {
    const driver = await dispatchJob(c.env, { type: 'health.record', payload: c.req.valid('json') });
    if (c.req.header('X-Inertia')) return c.redirect('/', 303);
    return c.json({ ok: true, driver });
  });
