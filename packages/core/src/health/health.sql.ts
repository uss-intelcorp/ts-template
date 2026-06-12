import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const healthChecks = sqliteTable(
  'health_checks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    source: text('source').notNull().default('system'),
    message: text('message').notNull().default('ok'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    createdAtIdx: index('idx_health_checks_created_at').on(sql`${table.createdAt} DESC`),
  }),
);

export type HealthCheck = typeof healthChecks.$inferSelect;
export type NewHealthCheck = typeof healthChecks.$inferInsert;
