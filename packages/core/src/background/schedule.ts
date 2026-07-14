import { z } from 'zod';
import { QueueJob, type QueueJob as QueueJobType } from '../queue/job';

function minuteBucket(date: Date): string {
  return date.toISOString().slice(0, 16);
}

export namespace BackgroundSchedule {
  export const CronExpression = z.string().trim().min(1).max(120);

  export interface OfferedJob {
    job: QueueJobType;
    options?: QueueJob.DispatchOptionsParsed;
  }

  export interface Definition {
    name: string;
    cron: string;
    offer(now: Date): OfferedJob;
  }

  export function heartbeat(cron = '*/5 * * * *'): Definition {
    return {
      name: 'heartbeat',
      cron: CronExpression.parse(cron),
      offer: (now) => ({
        job: {
          type: 'health.record',
          payload: { source: 'scheduler', message: 'scheduled heartbeat' },
        },
        options: QueueJob.DispatchOptions.parse({
          queue: 'default',
          idempotencyKey: `schedule:heartbeat:${minuteBucket(now)}`,
        }),
      }),
    };
  }

  export function all(input: { heartbeatCron?: string } = {}): Definition[] {
    return [heartbeat(input.heartbeatCron)];
  }
}
