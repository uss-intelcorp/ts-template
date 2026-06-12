import { z } from 'zod';
import { Health } from '../health/index';

export namespace QueueJob {
  export const HealthRecord = z.object({
    type: z.literal('health.record'),
    payload: Health.RecordInput,
  });

  export const Job = z.discriminatedUnion('type', [HealthRecord]);
  export type Job = z.infer<typeof Job>;

  export const DispatchOptions = z.object({
    queue: z.string().trim().min(1).max(80).default('default'),
    delaySeconds: z.number().int().min(0).max(604_800).default(0),
    maxAttempts: z.number().int().min(1).max(25).default(3),
    idempotencyKey: z.string().trim().min(1).max(255).optional(),
  });
  export type DispatchOptions = z.input<typeof DispatchOptions>;
  export type DispatchOptionsParsed = z.output<typeof DispatchOptions>;
}

export type QueueJob = QueueJob.Job;
