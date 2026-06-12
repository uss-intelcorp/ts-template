import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const queueJobs = sqliteTable(
  'queue_jobs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    queue: text('queue').notNull().default('default'),
    type: text('type').notNull(),
    payload: text('payload').notNull(),
    availableAt: text('available_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    reservedAt: text('reserved_at'),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    idempotencyKey: text('idempotency_key'),
    lastError: text('last_error'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    readyIdx: index('idx_queue_jobs_ready').on(table.queue, table.availableAt, table.reservedAt),
    idempotencyUnique: uniqueIndex('queue_jobs_idempotency_unique').on(table.idempotencyKey),
  }),
);

export const failedQueueJobs = sqliteTable(
  'failed_queue_jobs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    jobId: integer('job_id'),
    queue: text('queue').notNull(),
    type: text('type').notNull(),
    payload: text('payload').notNull(),
    attempts: integer('attempts').notNull(),
    error: text('error').notNull(),
    failedAt: text('failed_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    failedAtIdx: index('idx_failed_queue_jobs_failed_at').on(sql`${table.failedAt} DESC`),
  }),
);

export type QueueJobRow = typeof queueJobs.$inferSelect;
export type NewQueueJob = typeof queueJobs.$inferInsert;
export type FailedQueueJob = typeof failedQueueJobs.$inferSelect;
