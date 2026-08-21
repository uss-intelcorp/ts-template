import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '../util/database';
import { fn } from '../util/fn';
import { QueueJob, type QueueJob as QueueJobType } from './job';
import { failedQueueJobs, queueJobs, type QueueJobRow } from './queue.sql';

function sqliteDate(delaySeconds = 0): string {
  return new Date(Date.now() + delaySeconds * 1000).toISOString().slice(0, 19).replace('T', ' ');
}

function storedJob(row: QueueJobRow): QueueJobType {
  return QueueJob.Job.parse({ type: row.type, payload: JSON.parse(row.payload) });
}

export namespace SQLiteQueue {
  export type Row = QueueJobRow;

  export const DispatchInput = z.object({
    job: QueueJob.Job,
    options: QueueJob.DispatchOptions.optional(),
  });
  export type DispatchInput = z.infer<typeof DispatchInput>;

  export const dispatch = fn(DispatchInput, ({ job, options }) => {
    const parsed = QueueJob.DispatchOptions.parse(options ?? {});
    return Database.use((db) =>
      db
        .insert(queueJobs)
        .values({
          queue: parsed.queue,
          type: job.type,
          payload: JSON.stringify(job.payload),
          availableAt: sqliteDate(parsed.delaySeconds),
          maxAttempts: parsed.maxAttempts,
          idempotencyKey: parsed.idempotencyKey,
          createdAt: sql`(datetime('now'))`,
          updatedAt: sql`(datetime('now'))`,
        })
        .onConflictDoNothing({ target: queueJobs.idempotencyKey }),
    );
  });

  export const claim = fn(
    z.object({
      queue: z.string().trim().min(1).max(80).default('default'),
      reservationSeconds: z.number().int().min(1).max(3600).default(60),
    }),
    async ({ queue, reservationSeconds }): Promise<Row | null> => {
      return Database.use(async (db) => {
        const rows = await db
          .update(queueJobs)
          .set({
            reservedAt: sql`(datetime('now'))`,
            attempts: sql`${queueJobs.attempts} + 1`,
            updatedAt: sql`(datetime('now'))`,
          })
          .where(
            sql`${queueJobs.id} = (
              SELECT id FROM ${queueJobs}
              WHERE ${queueJobs.queue} = ${queue}
                AND ${queueJobs.availableAt} <= datetime('now')
                AND ${queueJobs.attempts} < ${queueJobs.maxAttempts}
                AND (
                  ${queueJobs.reservedAt} IS NULL
                  OR ${queueJobs.reservedAt} <= datetime('now', ${`-${reservationSeconds} seconds`})
                )
              ORDER BY ${queueJobs.availableAt} ASC, id ASC
              LIMIT 1
            )`,
          )
          .returning();

        return rows[0] ?? null;
      });
    },
  );

  export const complete = fn(z.object({ id: z.number().int().positive() }), ({ id }) =>
    Database.use((db) => db.delete(queueJobs).where(eq(queueJobs.id, id))),
  );

  export const release = fn(
    z.object({
      id: z.number().int().positive(),
      error: z.string().max(4000),
      delaySeconds: z.number().int().min(0).max(3600).default(30),
    }),
    ({ id, error, delaySeconds }) =>
      Database.use((db) =>
        db
          .update(queueJobs)
          .set({
            reservedAt: null,
            availableAt: sqliteDate(delaySeconds),
            lastError: error,
            updatedAt: sql`(datetime('now'))`,
          })
          .where(eq(queueJobs.id, id)),
      ),
  );

  export const fail = fn(
    z.object({
      row: z.custom<Row>(),
      error: z.string().max(4000),
    }),
    async ({ row, error }) => {
      await Database.use((db) =>
        db.insert(failedQueueJobs).values({
          jobId: row.id,
          queue: row.queue,
          type: row.type,
          payload: row.payload,
          attempts: row.attempts,
          error,
        }),
      );
      await complete({ id: row.id });
    },
  );

  export type WorkResult =
    | { status: 'empty' }
    | { status: 'completed'; id: number; type: string }
    | { status: 'released'; id: number; type: string; error: string }
    | { status: 'failed'; id: number; type: string; error: string };

  export async function workOnce(args: {
    queue?: string;
    reservationSeconds?: number;
    retryDelaySeconds?: number;
    handler: (job: QueueJobType) => Promise<void>;
  }): Promise<WorkResult> {
    const row = await claim({ queue: args.queue ?? 'default', reservationSeconds: args.reservationSeconds ?? 60 });
    if (!row) return { status: 'empty' };

    try {
      await args.handler(storedJob(row));
      await complete({ id: row.id });
      return { status: 'completed', id: row.id, type: row.type };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown queue handler failure';
      if (row.attempts >= row.maxAttempts) {
        await fail({ row, error });
        return { status: 'failed', id: row.id, type: row.type, error };
      }
      await release({ id: row.id, error, delaySeconds: args.retryDelaySeconds ?? row.attempts * 15 });
      return { status: 'released', id: row.id, type: row.type, error };
    }
  }
}
