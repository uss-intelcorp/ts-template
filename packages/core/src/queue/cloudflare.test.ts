import { describe, expect, it, vi } from 'vitest';
import { CloudflareQueue } from './cloudflare';
import type { QueueJob } from './job';

describe('CloudflareQueue', () => {
  it('sends parsed jobs with delay options', async () => {
    const send = vi.fn<CloudflareQueue.Producer['send']>().mockResolvedValue(undefined);
    const producer: CloudflareQueue.Producer = { send };

    await CloudflareQueue.dispatch(
      producer,
      { type: 'health.record', payload: { source: 'api', message: 'queued' } },
      { delaySeconds: 15 },
    );

    expect(send).toHaveBeenCalledWith(
      { type: 'health.record', payload: { source: 'api', message: 'queued' } },
      { delaySeconds: 15 },
    );
  });

  it('rejects invalid jobs before sending', async () => {
    const send = vi.fn<CloudflareQueue.Producer['send']>().mockResolvedValue(undefined);
    const producer: CloudflareQueue.Producer = { send };

    await expect(
      CloudflareQueue.dispatch(producer, { type: 'unknown', payload: {} } as unknown as QueueJob),
    ).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});
