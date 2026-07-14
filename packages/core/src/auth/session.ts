import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { users } from '../user/user.sql';
import { User } from '../user/index';
import { Database } from '../util/database';
import { fn } from '../util/fn';
import { randomBase64Url, sha256Base64Url } from './crypto';
import { authSessions, type AuthSessionRow } from './session.sql';

const TOKEN_BYTES = 32;
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30;

function sqliteDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export namespace AuthSession {
  export type Row = AuthSessionRow;

  export interface Created {
    token: string;
    expiresAt: string;
  }

  export const Token = z.string().min(32).max(200);

  export const create = fn(
    z.object({
      userId: z.number().int().positive(),
      ttlSeconds: z
        .number()
        .int()
        .positive()
        .max(60 * 60 * 24 * 365)
        .default(DEFAULT_TTL_SECONDS),
    }),
    async ({ userId, ttlSeconds }): Promise<Created> => {
      const token = randomBase64Url(TOKEN_BYTES);
      const tokenHash = await sha256Base64Url(token);
      const expiresAt = sqliteDate(new Date(Date.now() + ttlSeconds * 1000));

      await Database.use((db) =>
        db.insert(authSessions).values({
          userId,
          tokenHash,
          expiresAt,
          createdAt: sql`(datetime('now'))`,
          updatedAt: sql`(datetime('now'))`,
        }),
      );

      return { token, expiresAt };
    },
  );

  export const findUser = fn(Token, async (token): Promise<User.Public | null> => {
    const tokenHash = await sha256Base64Url(token);
    const rows = await Database.use((db) =>
      db
        .select({ user: users })
        .from(authSessions)
        .innerJoin(users, eq(authSessions.userId, users.id))
        .where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, sqliteDate(new Date()))))
        .limit(1),
    );

    return rows[0] ? User.toPublic(rows[0].user) : null;
  });

  export const destroy = fn(Token, async (token): Promise<void> => {
    const tokenHash = await sha256Base64Url(token);
    await Database.use((db) => db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash)));
  });

  export const destroyExpired = fn(z.void(), () =>
    Database.use((db) => db.delete(authSessions).where(lt(authSessions.expiresAt, sqliteDate(new Date())))),
  );
}
