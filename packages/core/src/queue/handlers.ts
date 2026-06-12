import { Health } from '../health/index';
import { QueueJob } from './job';

export async function runJob(input: unknown): Promise<void> {
  const job = QueueJob.Job.parse(input);

  switch (job.type) {
    case 'health.record':
      await Health.record(job.payload);
      return;
  }
}
