import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | null };

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("[Redis] REDIS_URL not set — cache disabled");
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] connection error:", err.message);
  });

  return client;
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined ? globalForRedis.redis : createRedisClient();

if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as { redis: Redis | null }).redis = redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // non-fatal
  }
}

export default redis;
