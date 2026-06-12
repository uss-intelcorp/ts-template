import { mkdir, readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_PATH = resolve(process.env.DATABASE_PATH ?? './data/ts-template.db');
const MIGRATIONS_DIR = resolve(process.env.MIGRATIONS_DIR ?? join(__dirname, '../../core/migrations'));

await mkdir(dirname(DATABASE_PATH), { recursive: true });
const client = createClient({ url: `file:${DATABASE_PATH}` });

await client.execute(
  `CREATE TABLE IF NOT EXISTS applied_migrations (
     name TEXT PRIMARY KEY,
     applied_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
);

const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort();
const appliedRes = await client.execute('SELECT name FROM applied_migrations');
const applied = new Set(appliedRes.rows.map((row) => String(row.name)));

let count = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip ${file}`);
    continue;
  }
  const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
  console.log(`apply ${file}`);
  await client.executeMultiple(sql);
  await client.execute({ sql: 'INSERT INTO applied_migrations (name) VALUES (?)', args: [file] });
  count++;
}

console.log(count === 0 ? `Up to date (${DATABASE_PATH}).` : `Applied ${count} migration(s) -> ${DATABASE_PATH}.`);
client.close();
