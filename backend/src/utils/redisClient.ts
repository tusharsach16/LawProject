import { createClient, RedisClientType } from "redis";

let redis: RedisClientType | null = null;
let isRedisConnected = false;

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Redis operation timeout')), timeoutMs)
    ),
  ]);
};

export const initRedis = async () => {
  try {
    const url = process.env.REDIS_URL;
    if (!url) {
      redis = null;
      isRedisConnected = false;
      return;
    }

    redis = createClient({
      url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Redis connection failed");
          }
          return Math.min(retries * 50, 3000);
        },
        connectTimeout: 10000,
      }
    });

    redis.on("ready", () => {
      isRedisConnected = true;
    });

    redis.on("error", (err) => {
      console.error("Redis error:", err.message);
      isRedisConnected = false;
    });

    redis.on("reconnecting", () => {
      isRedisConnected = false;
    });

    await withTimeout(redis.connect(), 10000);
  } catch (err) {
    console.error("Redis initialization failed:", err);
    redis = null;
    isRedisConnected = false;
  }
};

export const isRedisAvailable = (): boolean => {
  return redis !== null && isRedisConnected;
};

export const redisGet = async (key: string): Promise<string | null> => {
  if (!redis || !isRedisConnected) return null;
  try {
    return await withTimeout(redis.get(key), 3000);
  } catch (err) {
    console.error(`Redis GET error for key ${key}:`, err);
    return null;
  }
};

export const redisSet = async (
  key: string,
  value: string,
  ttl?: number
): Promise<boolean> => {
  if (!redis || !isRedisConnected) return false;
  try {
    if (ttl) {
      await withTimeout(redis.setEx(key, ttl, value), 3000);
    } else {
      await withTimeout(redis.set(key, value), 3000);
    }
    return true;
  } catch (err) {
    console.error(`Redis SET error for key ${key}:`, err);
    return false;
  }
};

export const redisDel = async (key: string): Promise<boolean> => {
  if (!redis || !isRedisConnected) return false;
  try {
    await withTimeout(redis.del(key), 3000);
    return true;
  } catch (err) {
    console.error(`Redis DEL error for key ${key}:`, err);
    return false;
  }
};

export const redisLRem = async (key: string, count: number, value: string): Promise<number> => {
  if (!redis || !isRedisConnected) return 0;
  try {
    return await withTimeout(redis.lRem(key, count, value), 3000);
  } catch (err) {
    console.error(`Redis LREM error for key ${key}:`, err);
    return 0;
  }
};

export const redisLPop = async (key: string): Promise<string | null> => {
  if (!redis || !isRedisConnected) return null;
  try {
    return await withTimeout(redis.lPop(key), 3000);
  } catch (err) {
    console.error(`Redis LPOP error for key ${key}:`, err);
    return null;
  }
};

export const redisRPush = async (key: string, value: string): Promise<number> => {
  if (!redis || !isRedisConnected) return 0;
  try {
    return await withTimeout(redis.rPush(key, value), 3000);
  } catch (err) {
    console.error(`Redis RPUSH error for key ${key}:`, err);
    return 0;
  }
};

export const redisLRange = async (key: string, start: number, stop: number): Promise<string[]> => {
  if (!redis || !isRedisConnected) return [];
  try {
    return await withTimeout(redis.lRange(key, start, stop), 3000);
  } catch (err) {
    console.error(`Redis LRANGE error for key ${key}:`, err);
    return [];
  }
};

export const redisExpire = async (key: string, seconds: number): Promise<boolean> => {
  if (!redis || !isRedisConnected) return false;
  try {
    const result = await withTimeout(redis.expire(key, seconds), 3000);
    return result === 1;
  } catch (err) {
    console.error(`Redis EXPIRE error for key ${key}:`, err);
    return false;
  }
};

export { redis };