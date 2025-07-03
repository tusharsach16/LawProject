import { createClient } from "redis";
export const redis = createClient({ url: process.env.REDIS_URL });

(async () => {
  try {
    await redis.connect();
    console.log("Redis connected ✅");
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();
