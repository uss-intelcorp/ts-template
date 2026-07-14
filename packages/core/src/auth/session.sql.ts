import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { users } from '../user/user.sql';

export const authSessions = sqliteTable(
  'auth_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex('auth_sessions_token_hash_unique').on(table.tokenHash),
    userIdIdx: index('idx_auth_sessions_user_id').on(table.userId),
    expiresAtIdx: index('idx_auth_sessions_expires_at').on(table.expiresAt),
  }),
);

export type AuthSessionRow = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
