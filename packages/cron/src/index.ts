import cron from 'node-cron';
import { createRuntime } from './runtime';

const HEARTBEAT_CRON = process.env.HEARTBEAT_CRON ?? '*/5 * * * *';

if (!cron.validate(HEARTBEAT_CRON)) {
  console.error(`Invalid HEARTBEAT_CRON "${HEARTBEAT_CRON}".`);
  process.exit(1);
}

const runtime = await createRuntime();

const task = cron.schedule(HEARTBEAT_CRON, () => {
  void runtime.heartbeat().catch((err) => console.error('heartbeat failed', err));
});

console.log(`ts-template heartbeat scheduled: "${HEARTBEAT_CRON}" (db: ${runtime.databasePath})`);

function shutdown(signal: string): void {
  console.log(`received ${signal}; stopping cron tasks`);
  task.stop();
  runtime.client.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
