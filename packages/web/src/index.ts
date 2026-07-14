import { drizzle } from 'drizzle-orm/d1';
import { BackgroundSchedule } from '@ts-template/core/background/schedule';
import * as schema from '@ts-template/core/db/schema';
import { CloudflareQueue } from '@ts-template/core/queue/cloudflare';
import { runJob } from '@ts-template/core/queue/handlers';
import { QueueJob } from '@ts-template/core/queue/job';
import { SQLiteQueue } from '@ts-template/core/queue/sqlite';
import { Database } from '@ts-template/core/util/database';
import app, { type Env } from './server';
import './pages.gen';

interface WorkerEnv extends Omit<Env, 'DB' | 'ASSETS'> {
  DB: D1Database;
  ASSETS: Fetcher;
  JOB_QUEUE?: Queue<QueueJob>;
  HEARTBEAT_CRON?: string;
}

function toAppEnv(env: WorkerEnv): Env {
  return { ...env, DB: drizzle(env.DB, { schema }) };
}

async function offerScheduledJob(env: WorkerEnv, offered: BackgroundSchedule.OfferedJob): Promise<void> {
  if (env.JOB_QUEUE) {
    await CloudflareQueue.dispatch(env.JOB_QUEUE, offered.job, offered.options);
    return;
  }

  await SQLiteQueue.dispatch({ job: offered.job, options: offered.options });
}

export default {
  fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    return app.fetch(request, toAppEnv(env), ctx);
  },

  async queue(batch: MessageBatch<QueueJob>, env: WorkerEnv, _ctx: ExecutionContext) {
    const db = drizzle(env.DB, { schema });

    await Database.provide(db, async () => {
      for (const message of batch.messages) {
        try {
          await runJob(QueueJob.Job.parse(message.body));
          message.ack();
        } catch (err) {
          console.error('queue message failed', err);
          message.retry();
        }
      }
    });
  },

  async scheduled(controller: ScheduledController, env: WorkerEnv, _ctx: ExecutionContext) {
    const db = drizzle(env.DB, { schema });
    const now = new Date(controller.scheduledTime);
    const schedules = BackgroundSchedule.all({ heartbeatCron: env.HEARTBEAT_CRON }).filter(
      (schedule) => schedule.cron === controller.cron,
    );

    await Database.provide(db, async () => {
      for (const schedule of schedules) await offerScheduledJob(env, schedule.offer(now));
    });
  },
};
