import { createClient, RedisClientType } from "redis";

let redis: RedisClientType | null = null;
let isRedisConnected = false;

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
          if (retries > 10) return new Error("Redis connection failed");
          return Math.min(retries * 50, 3000);
        }
      }
    });

    redis.on("ready", () => {
      isRedisConnected = true;
    });

    redis.on("error", () => {
      isRedisConnected = false;
    });

    await redis.connect();
  } catch {
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
    return await redis.get(key);
  } catch {
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
    if (ttl) await redis.setEx(key, ttl, value);
    else await redis.set(key, value);
    return true;
  } catch {
    return false;
  }
};

export const redisDel = async (key: string): Promise<boolean> => {
  if (!redis || !isRedisConnected) return false;
  try {
    await redis.del(key);
    return true;
  } catch {
    return false;
  }
};

export const redisLRem = async (key: string, count: number, value: string): Promise<number> => {
  if (!redis || !isRedisConnected) return 0;
  try {
    return await redis.lRem(key, count, value);
  } catch {
    return 0;
  }
};

export const redisLPop = async (key: string): Promise<string | null> => {
  if (!redis || !isRedisConnected) return null;
  try {
    return await redis.lPop(key);
  } catch {
    return null;
  }
};

export const redisRPush = async (key: string, value: string): Promise<number> => {
  if (!redis || !isRedisConnected) return 0;
  try {
    return await redis.rPush(key, value);
  } catch {
    return 0;
  }
};

export const redisLRange = async (key: string, start: number, stop: number): Promise<string[]> => {
  if (!redis || !isRedisConnected) return [];
  try {
    return await redis.lRange(key, start, stop);
  } catch {
    return [];
  }
};

export const redisExpire = async (key: string, seconds: number): Promise<boolean> => {
  if (!redis || !isRedisConnected) return false;
  try {
    const result = await redis.expire(key, seconds);
    return result === 1; // Redis returns 1 for success, 0 for failure
  } catch {
    return false;
  }
};

export { redis };