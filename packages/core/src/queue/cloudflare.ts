import { QueueJob, type QueueJob as QueueJobType } from './job';

export namespace CloudflareQueue {
  export interface Producer<Result = void> {
    send(message: QueueJobType, options?: { delaySeconds?: number }): Promise<Result>;
  }

  export async function dispatch<Result>(
    producer: Producer<Result>,
    job: QueueJobType,
    options: QueueJob.DispatchOptions = {},
  ): Promise<void> {
    const parsed = QueueJob.DispatchOptions.parse(options);
    await producer.send(QueueJob.Job.parse(job), { delaySeconds: parsed.delaySeconds });
  }
}
