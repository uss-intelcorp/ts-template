import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@ts-template/core/db/schema';
import { Health } from '@ts-template/core/health/index';
import type { DB } from '@ts-template/core/util/database';
import { Database } from '@ts-template/core/util/database';

const DATABASE_PATH = resolve(process.env.DATABASE_PATH ?? '../web/data/ts-template.db');

export async function createRuntime() {
  await mkdir(dirname(DATABASE_PATH), { recursive: true });
  const client = createClient({ url: `file:${DATABASE_PATH}` });
  const db = drizzle(client, { schema });

  return {
    databasePath: DATABASE_PATH,
    client,
    db,
    withDatabase: <R>(fn: () => R): R => Database.provide(db as DB, fn),
    heartbeat: () =>
      Database.provide(db, async () => {
        await Health.record({ source: 'cron', message: 'scheduled heartbeat' });
      }),
  };
}
