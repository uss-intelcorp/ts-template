import { desc } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '../util/database';
import { fn } from '../util/fn';
import { type HealthCheck, healthChecks } from './health.sql';

export namespace Health {
  export type Row = HealthCheck;

  export interface Status {
    ok: true;
    timestamp: string;
  }

  export const RecordInput = z.object({
    source: z.string().trim().min(1).max(80).default('system'),
    message: z.string().trim().min(1).max(500).default('ok'),
  });
  export type RecordInput = z.infer<typeof RecordInput>;

  export const status = fn(z.void(), (): Status => ({ ok: true, timestamp: new Date().toISOString() }));

  export const record = fn(RecordInput, (input) =>
    Database.use((db) => db.insert(healthChecks).values(input).returning()),
  );

  export const recent = fn(z.number().int().positive().max(100).default(20), (limit): Promise<Row[]> =>
    Database.use((db) => db.select().from(healthChecks).orderBy(desc(healthChecks.createdAt)).limit(limit)),
  );
}
