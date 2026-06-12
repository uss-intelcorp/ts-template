import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@ts-template/core/db/schema';
import { runJob } from '@ts-template/core/queue/handlers';
import { QueueJob } from '@ts-template/core/queue/job';
import { Database } from '@ts-template/core/util/database';
import app, { type Env } from './server';
import './pages.gen';

interface WorkerEnv extends Omit<Env, 'DB' | 'ASSETS'> {
  DB: D1Database;
  ASSETS: Fetcher;
  JOB_QUEUE?: Queue<QueueJob>;
}

function toAppEnv(env: WorkerEnv): Env {
  return { ...env, DB: drizzle(env.DB, { schema }) };
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
};
