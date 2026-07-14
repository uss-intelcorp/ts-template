import { describe, expect, it } from 'vitest';
import { Database, type DB } from './database';

describe('Database', () => {
  it('provides the active database context', () => {
    const db = { marker: 'db' } as unknown as DB;

    const result = Database.provide(db, () => Database.use((current) => current));

    expect(result).toBe(db);
  });

  it('throws when database context is missing', () => {
    expect(() => Database.use((db) => db)).toThrow('Database context not set');
  });
});
