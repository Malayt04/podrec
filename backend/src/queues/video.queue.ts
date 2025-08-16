import { Queue } from 'bullmq';
import { bullmqConnection } from '../utils/redis';

export const videoQueue = new Queue('video-processing', {
  connection: bullmqConnection,
});
