import { describe, expect, it } from 'vitest';
import { Health } from './index';

describe('Health', () => {
  it('returns an ok status with an ISO timestamp', () => {
    const status = Health.status();

    expect(status.ok).toBe(true);
    expect(new Date(status.timestamp).toISOString()).toBe(status.timestamp);
  });

  it('normalizes record input', () => {
    expect(Health.RecordInput.parse({ source: ' worker ', message: ' ok ' })).toEqual({
      source: 'worker',
      message: 'ok',
    });
  });

  it('applies default record input values', () => {
    expect(Health.RecordInput.parse({})).toEqual({ source: 'system', message: 'ok' });
  });

  it('rejects blank record fields after trimming', () => {
    expect(() => Health.RecordInput.parse({ source: ' ', message: 'ok' })).toThrow();
    expect(() => Health.RecordInput.parse({ source: 'system', message: ' ' })).toThrow();
  });
});
