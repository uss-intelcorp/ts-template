import { describe, expect, it } from 'vitest';
import { QueueJob } from './job';

describe('QueueJob', () => {
  it('parses health record jobs and normalizes payload defaults', () => {
    expect(QueueJob.Job.parse({ type: 'health.record', payload: {} })).toEqual({
      type: 'health.record',
      payload: { source: 'system', message: 'ok' },
    });
  });

  it('rejects unsupported job types', () => {
    expect(() => QueueJob.Job.parse({ type: 'unknown', payload: {} })).toThrow();
  });

  it('parses dispatch options with defaults', () => {
    expect(QueueJob.DispatchOptions.parse({})).toEqual({
      queue: 'default',
      delaySeconds: 0,
      maxAttempts: 3,
    });
  });

  it('normalizes dispatch option strings', () => {
    expect(QueueJob.DispatchOptions.parse({ queue: ' critical ', idempotencyKey: ' health:1 ' })).toEqual({
      queue: 'critical',
      delaySeconds: 0,
      maxAttempts: 3,
      idempotencyKey: 'health:1',
    });
  });

  it('rejects invalid dispatch retry settings', () => {
    expect(() => QueueJob.DispatchOptions.parse({ delaySeconds: 604_801 })).toThrow();
    expect(() => QueueJob.DispatchOptions.parse({ maxAttempts: 26 })).toThrow();
  });
});
