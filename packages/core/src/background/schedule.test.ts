import { describe, expect, it } from 'vitest';
import { BackgroundSchedule } from './schedule';

describe('BackgroundSchedule', () => {
  it('defines the heartbeat schedule as a queued job offer', () => {
    const [heartbeat] = BackgroundSchedule.all({ heartbeatCron: '*/10 * * * *' });
    const offered = heartbeat!.offer(new Date('2026-06-24T12:34:56.000Z'));

    expect(heartbeat).toMatchObject({ name: 'heartbeat', cron: '*/10 * * * *' });
    expect(offered).toEqual({
      job: {
        type: 'health.record',
        payload: { source: 'scheduler', message: 'scheduled heartbeat' },
      },
      options: {
        queue: 'default',
        delaySeconds: 0,
        maxAttempts: 3,
        idempotencyKey: 'schedule:heartbeat:2026-06-24T12:34',
      },
    });
  });

  it('rejects empty cron expressions', () => {
    expect(() => BackgroundSchedule.heartbeat(' ')).toThrow();
  });
});
