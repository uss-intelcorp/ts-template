import cron from 'node-cron';
import { BackgroundSchedule } from '@ts-template/core/background/schedule';
import { createRuntime } from './runtime';

const schedules = BackgroundSchedule.all({ heartbeatCron: process.env.HEARTBEAT_CRON });

for (const schedule of schedules) {
  if (!cron.validate(schedule.cron)) {
    console.error(`Invalid cron expression for ${schedule.name}: "${schedule.cron}".`);
    process.exit(1);
  }
}

const runtime = await createRuntime();
const tasks = schedules.map((schedule) => ({
  name: schedule.name,
  cron: schedule.cron,
  task: cron.schedule(schedule.cron, () => {
    const offered = schedule.offer(new Date());
    void runtime.offer(offered).catch((err) => console.error(`scheduler failed to offer ${schedule.name}`, err));
  }),
}));

console.log(
  `ts-template scheduler started: ${tasks.map((task) => `${task.name}="${task.cron}"`).join(', ')} (db: ${runtime.databasePath})`,
);

function shutdown(signal: string): void {
  console.log(`received ${signal}; stopping scheduler`);
  for (const { task } of tasks) task.stop();
  runtime.client.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
