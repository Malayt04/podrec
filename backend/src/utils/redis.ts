import { Redis } from "@upstash/redis";
import RedisClient from "ioredis";

let redis: Redis;
let bullmqConnection: RedisClient;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.log("✅ Using UPSTASH_REDIS for connection");
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.error("⚠️ UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in the environment.");
  process.exit(1);
}

if (process.env.REDIS_URL) {
    console.log('✅ Using REDIS_URL for bullmq connection');
    bullmqConnection = new RedisClient(process.env.REDIS_URL);
} else {
    console.log('⚠️  Using fallback host/port configuration for bullmq');
    bullmqConnection = new RedisClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        maxRetriesPerRequest: null
    });
}

export { redis, bullmqConnection };
