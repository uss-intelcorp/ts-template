import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { hashPassword, PasswordInput, verifyPassword } from '../auth/password';
import { Database } from '../util/database';
import { fn } from '../util/fn';
import { users, type UserRow } from './user.sql';

const Email = z
  .string()
  .trim()
  .pipe(z.email().max(255))
  .transform((email) => email.toLowerCase());
const Name = z.string().trim().min(1).max(120);

export namespace User {
  export type Row = UserRow;

  export interface Public {
    id: number;
    name: string;
    email: string;
    twoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export const RegisterInput = z
    .object({
      name: Name,
      email: Email,
      password: PasswordInput,
      passwordConfirmation: z.string(),
    })
    .refine((input) => input.password === input.passwordConfirmation, {
      path: ['passwordConfirmation'],
      message: 'Passwords do not match.',
    });
  export type RegisterInput = z.infer<typeof RegisterInput>;

  export const LoginInput = z.object({
    email: Email,
    password: z.string().min(1).max(128),
  });
  export type LoginInput = z.infer<typeof LoginInput>;

  export const ProfileInput = z.object({
    userId: z.number().int().positive(),
    name: Name,
    email: Email,
  });
  export type ProfileInput = z.infer<typeof ProfileInput>;

  export const PasswordUpdateInput = z
    .object({
      userId: z.number().int().positive(),
      currentPassword: z.string().min(1).max(128),
      password: PasswordInput,
      passwordConfirmation: z.string(),
    })
    .refine((input) => input.password === input.passwordConfirmation, {
      path: ['passwordConfirmation'],
      message: 'Passwords do not match.',
    });
  export type PasswordUpdateInput = z.infer<typeof PasswordUpdateInput>;

  export function toPublic(row: Row): Public {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      twoFactorEnabled: row.twoFactorConfirmedAt !== null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  export const find = fn(z.number().int().positive(), async (id): Promise<Public | null> => {
    const rows = await Database.use((db) => db.select().from(users).where(eq(users.id, id)).limit(1));
    return rows[0] ? toPublic(rows[0]) : null;
  });

  export const findByEmail = fn(Email, async (email): Promise<Row | null> => {
    const rows = await Database.use((db) => db.select().from(users).where(eq(users.email, email)).limit(1));
    return rows[0] ?? null;
  });

  export const create = fn(RegisterInput, async (input): Promise<Public> => {
    const passwordHash = await hashPassword(input.password);
    const rows = await Database.use((db) =>
      db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash,
          createdAt: sql`(datetime('now'))`,
          updatedAt: sql`(datetime('now'))`,
        })
        .returning(),
    );
    return toPublic(rows[0]!);
  });

  export const verifyCredentials = fn(LoginInput, async (input): Promise<Public | null> => {
    const row = await findByEmail(input.email);
    if (!row) return null;
    return (await verifyPassword(input.password, row.passwordHash)) ? toPublic(row) : null;
  });

  export const updateProfile = fn(ProfileInput, async (input): Promise<Public | null> => {
    const rows = await Database.use((db) =>
      db
        .update(users)
        .set({ name: input.name, email: input.email, updatedAt: sql`(datetime('now'))` })
        .where(eq(users.id, input.userId))
        .returning(),
    );
    return rows[0] ? toPublic(rows[0]) : null;
  });

  export const updatePassword = fn(PasswordUpdateInput, async (input): Promise<boolean> => {
    const rows = await Database.use((db) => db.select().from(users).where(eq(users.id, input.userId)).limit(1));
    const row = rows[0];
    if (!row || !(await verifyPassword(input.currentPassword, row.passwordHash))) return false;

    const passwordHash = await hashPassword(input.password);
    await Database.use((db) =>
      db
        .update(users)
        .set({ passwordHash, updatedAt: sql`(datetime('now'))` })
        .where(eq(users.id, input.userId)),
    );
    return true;
  });
}
