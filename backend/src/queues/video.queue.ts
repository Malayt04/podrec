import { Queue } from 'bullmq';
import { redisConnection } from '../utils/redis';

export const videoQueue = new Queue('video-processing', {
  connection: redisConnection,
});
