import { AsyncLocalStorage } from 'node:async_hooks';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

export type DB = BaseSQLiteDatabase<'async', unknown, typeof import('../db/schema')>;

const storage = new AsyncLocalStorage<DB>();

export namespace Database {
  export function provide<R>(db: DB, fn: () => R): R {
    return storage.run(db, fn);
  }

  export function use<R>(cb: (db: DB) => R): R {
    const db = storage.getStore();
    if (!db) {
      throw new Error('Database context not set. Wrap with Database.provide(env.DB, () => ...) at the boundary.');
    }
    return cb(db);
  }
}
