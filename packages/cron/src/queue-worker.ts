import { runJob } from '@ts-template/core/queue/handlers';
import { SQLiteQueue } from '@ts-template/core/queue/sqlite';
import { createRuntime } from './runtime';

const QUEUE_NAME = process.env.QUEUE_NAME ?? 'default';
const QUEUE_POLL_MS = Math.max(100, Math.trunc(Number(process.env.QUEUE_POLL_MS ?? '1000')));
const QUEUE_RESERVATION_SECONDS = Math.max(1, Math.trunc(Number(process.env.QUEUE_RESERVATION_SECONDS ?? '60')));

const runtime = await createRuntime();
let stopping = false;

function shutdown(signal: string): void {
  console.log(`received ${signal}; stopping queue worker`);
  stopping = true;
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tick(): Promise<void> {
  const result = await runtime.withDatabase(() =>
    SQLiteQueue.workOnce({
      queue: QUEUE_NAME,
      reservationSeconds: QUEUE_RESERVATION_SECONDS,
      handler: runJob,
    }),
  );

  if (result.status === 'empty') await sleep(QUEUE_POLL_MS);
  else console.log('queue worker', result);
}

console.log(`ts-template queue worker started: "${QUEUE_NAME}" (db: ${runtime.databasePath})`);

while (!stopping) {
  try {
    await tick();
  } catch (err) {
    console.error('queue worker tick failed', err);
    await sleep(QUEUE_POLL_MS);
  }
}

runtime.client.close();
