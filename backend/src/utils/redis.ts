import Redis from "ioredis";




// Declare variables that will be exported
let subscriber: Redis;
let publisher: Redis;
let redisConnection: any;

if (process.env.REDIS_URL) {
  console.log('✅ Using REDIS_URL for connection');
  
  subscriber = new Redis(process.env.REDIS_URL);
  publisher = new Redis(process.env.REDIS_URL);
  
  redisConnection = { url: process.env.REDIS_URL };
  
} else {
  console.log('⚠️  Using fallback host/port configuration');
  
  const hostConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null
  };
  
  subscriber = new Redis(hostConfig);
  publisher = new Redis(hostConfig);
  redisConnection = hostConfig;
}

export { subscriber, publisher, redisConnection };
