import { QueueJob, type QueueJob as QueueJobType } from './job';

export namespace CloudflareQueue {
  export interface Producer {
    send(message: QueueJobType, options?: { delaySeconds?: number }): Promise<unknown>;
  }

  export async function dispatch(
    producer: Producer,
    job: QueueJobType,
    options: QueueJob.DispatchOptions = {},
  ): Promise<void> {
    const parsed = QueueJob.DispatchOptions.parse(options);
    await producer.send(QueueJob.Job.parse(job), { delaySeconds: parsed.delaySeconds });
  }
}
