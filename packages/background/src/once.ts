import { BackgroundSchedule } from '@ts-template/core/background/schedule';
import { createRuntime } from './runtime';

const runtime = await createRuntime();

for (const schedule of BackgroundSchedule.all({ heartbeatCron: process.env.HEARTBEAT_CRON })) {
  await runtime.offer(schedule.offer(new Date()));
  console.log(`offered ${schedule.name} (db: ${runtime.databasePath})`);
}

runtime.client.close();
