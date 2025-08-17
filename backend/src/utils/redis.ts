import { Redis } from "@upstash/redis";
import RedisClient from "ioredis";

let redis: Redis;
let bullmqConnection: RedisClient;
let subscriber: RedisClient;

// Parse Redis URL only if it exists
let parsedUrl: URL | null = null;
let host: string | undefined;
let port: number | undefined;

if (process.env.REDIS_URL) {
  try {
    parsedUrl = new URL(process.env.REDIS_URL);
    host = parsedUrl.hostname;
    port = parseInt(parsedUrl.port, 10);
  } catch (error) {
    console.error("⚠️ Invalid REDIS_URL format:", error);
  }
}

// Initialize Upstash Redis (for REST API operations)
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

// Initialize ioredis connections (for BullMQ and pub/sub)
if (process.env.REDIS_URL) {
  console.log('✅ Using REDIS_URL for bullmq connection');
  
  // Create Redis configuration object for better control
  const redisConfig = {
    // Let ioredis parse the URL automatically (simplest approach)
    // OR use parsed components for more control
    host: parsedUrl?.hostname,
    port: parsedUrl?.port ? parseInt(parsedUrl.port, 10) : undefined,
    username: parsedUrl?.username || undefined,
    password: parsedUrl?.password || undefined,
    // Enable TLS for rediss:// URLs
    tls: parsedUrl?.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    // Add connection timeout and retry settings
    connectTimeout: 10000,
    lazyConnect: true,
    retryDelayOnFailover: 100,
  };

  // Option 1: Use URL directly (recommended - simpler)
  bullmqConnection = new RedisClient(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    lazyConnect: true,
  });
  
  subscriber = new RedisClient(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    lazyConnect: true,
  });

  // Option 2: Use parsed config (uncomment if you need more control)
  // bullmqConnection = new RedisClient(redisConfig);
  // subscriber = new RedisClient(redisConfig);

} else {
  console.log('⚠️ Using fallback host/port configuration for bullmq');
  const fallbackConfig = {
    host: host || process.env.REDIS_HOST || 'localhost',
    port: port || parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    lazyConnect: true,
  };
  
  bullmqConnection = new RedisClient(fallbackConfig);
  subscriber = new RedisClient(fallbackConfig);
}

// Add error handlers to prevent crashes
bullmqConnection.on('error', (err) => {
  console.error('BullMQ Redis connection error:', err.message);
});

subscriber.on('error', (err) => {
  console.error('Subscriber Redis connection error:', err.message);
});

// Add connection success logging
bullmqConnection.on('connect', () => {
  console.log('✅ BullMQ Redis connected successfully');
});

subscriber.on('connect', () => {
  console.log('✅ Subscriber Redis connected successfully');
});

export { redis, bullmqConnection, subscriber };