import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { field, validationErrors } from './forms';

describe('validationErrors', () => {
  it('maps a failed field to its message', () => {
    const schema = z.object({ name: z.string().min(1, 'Required.') });
    const result = schema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(validationErrors(result.error)).toEqual({ name: 'Required.' });
  });

  it('keeps the first message when a key has multiple issues', () => {
    const schema = z.object({
      email: z.string().min(5, 'Too short.').regex(/@/u, 'Must contain @.'),
    });
    const result = schema.safeParse({ email: 'abc' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(validationErrors(result.error)).toEqual({ email: 'Too short.' });
  });

  it('skips issues whose path head is not a string', () => {
    const schema = z.array(z.string({ message: 'Must be a string.' }));
    const result = schema.safeParse([42]);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(validationErrors(result.error)).toEqual({});
  });
});

describe('field', () => {
  it('returns a string value as-is', () => {
    expect(field({ name: 'Jane' }, 'name')).toBe('Jane');
  });

  it('returns the first element of a string array', () => {
    expect(field({ tags: ['one', 'two'] }, 'tags')).toBe('one');
  });

  it('returns an empty string for missing or non-string values', () => {
    expect(field({}, 'name')).toBe('');
    expect(field({ count: 3 }, 'count')).toBe('');
    expect(field({ tags: [7] }, 'tags')).toBe('');
  });
});
