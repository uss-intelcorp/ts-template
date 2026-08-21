import { Health } from '../health/index';
import { QueueJob } from './job';

export async function runJob(job: QueueJob.Job): Promise<void> {
  switch (job.type) {
    case 'health.record':
      await Health.record(job.payload);
      return;
    default:
      throw new Error('Unsupported queue job type.');
  }
}
