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

/**
 * Sanitizes a Redis connection URL so credentials/passwords are never logged.
 * Example output: rediss://default:***@xxxx.upstash.io:6379
 */
export const sanitizeRedisUrl = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl);
    const hasPassword = Boolean(parsed.password);
    const hasUsername = Boolean(parsed.username);
    const authPart = hasUsername
      ? `${parsed.username}:${hasPassword ? '***' : ''}@`
      : hasPassword
      ? ':***@'
      : '';
    return `${parsed.protocol}//${authPart}${parsed.host}`;
  } catch {
    return rawUrl.replace(/:\/\/[^@]+@/, '://***@').slice(0, 40);
  }
};

export const initRedis = async () => {
  try {
    let rawUrl = (process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '').trim();

    // Strip surrounding quotes if accidentally included in environment variable
    if ((rawUrl.startsWith('"') && rawUrl.endsWith('"')) || (rawUrl.startsWith("'") && rawUrl.endsWith("'"))) {
      rawUrl = rawUrl.slice(1, -1).trim();
    }

    if (!rawUrl) {
      console.log("[Redis] No REDIS_URL or UPSTASH_REDIS_URL configured. Caching is disabled.");
      redis = null;
      isRedisConnected = false;
      return;
    }

    // Guard against accidentally copying an Upstash REST API URL (starts with http:// or https://)
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      console.error(
        "[Redis] Configuration Error: The configured Redis URL starts with HTTP(S). " +
        "Upstash REST URLs cannot be used with node-redis. " +
        "Please use the Redis TCP connection string starting with 'rediss://' from the Upstash Console."
      );
      redis = null;
      isRedisConnected = false;
      return;
    }

    // Auto-detect Upstash endpoints using unencrypted redis:// and upgrade to rediss:// (TLS)
    let url = rawUrl;
    let parsedHostname: string | undefined;
    try {
      const parsed = new URL(rawUrl);
      parsedHostname = parsed.hostname;
      if (parsed.protocol === 'redis:' && parsed.hostname.endsWith('upstash.io')) {
        console.warn(
          `[Redis] Notice: Upstash endpoint '${parsed.hostname}' detected with unencrypted 'redis://'. ` +
          "Automatically upgrading to 'rediss://' (TLS enabled). " +
          "Please update your Render environment variable to start with 'rediss://'."
        );
        url = rawUrl.replace(/^redis:\/\//i, 'rediss://');
      }
    } catch {
      // If URL parsing fails, pass rawUrl to createClient which will handle URL validation
    }

    const sanitized = sanitizeRedisUrl(url);
    const isTls = url.startsWith('rediss://');
    console.log(`[Redis] Connecting to ${sanitized} (TLS: ${isTls ? 'enabled' : 'disabled'})...`);

    redis = createClient({
      url,
      socket: {
        // Explicitly supply servername for TLS SNI routing (critical for multi-tenant cloud proxies like Upstash)
        servername: isTls && parsedHostname ? parsedHostname : undefined,
        connectTimeout: 10000,
        reconnectStrategy: (retries, cause) => {
          // Cap retries to prevent infinite retry loops if credentials or endpoint are wrong
          if (retries >= 5) {
            return new Error(`Max reconnection attempts reached (${retries}). Last cause: ${cause?.message || 'Unknown'}`);
          }
          // Exponential backoff: 200ms, 400ms, 800ms, 1600ms, max 3000ms
          const delay = Math.min(100 * Math.pow(2, retries), 3000);
          console.warn(`[Redis] Connection retry #${retries + 1} in ${delay}ms (Cause: ${cause?.message || 'Network error'})`);
          return delay;
        },
      }
    });

    redis.on("connect", () => {
      console.log("[Redis] Socket connection established.");
    });

    redis.on("ready", () => {
      isRedisConnected = true;
      console.log("[Redis] Client ready and caching active.");
    });

    redis.on("error", (err) => {
      console.error("[Redis] Socket error:", err.message);
      isRedisConnected = false;
    });

    redis.on("reconnecting", () => {
      console.warn("[Redis] Connection lost. Reconnecting...");
      isRedisConnected = false;
    });

    redis.on("end", () => {
      console.log("[Redis] Connection closed.");
      isRedisConnected = false;
    });

    await withTimeout(redis.connect(), 10000);
  } catch (err: any) {
    const underlying = err?.socketError || err?.originalError || err?.cause;
    console.error(`[Redis] Initialization failed: ${err.message}${underlying ? ` (Underlying: ${underlying.message})` : ''}`);

    if (err.message?.includes('Socket closed unexpectedly') || underlying?.message?.includes('Socket closed unexpectedly')) {
      console.error(
        "[Redis] Troubleshooting Hint: 'Socket closed unexpectedly' usually indicates:\n" +
        "  1. The Redis URL must use 'rediss://' (TLS) for Upstash cloud databases.\n" +
        "  2. The Upstash database password/token or host is incorrect or expired.\n" +
        "  3. Verify in your Upstash Console that the database is Active and copy the 'node-redis' URL directly."
      );
    }

    try {
      if (redis?.isOpen) {
        await redis.disconnect();
      }
    } catch {
      // Ignore disconnect errors
    }
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

export const getRedisClient = (): RedisClientType => {
  if (!redis) {
    throw new Error("Redis client not initialized or connection failed");
  }
  return redis;
};

export { redis };