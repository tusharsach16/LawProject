import { createClient } from "redis";

let redis: any = null;

(async () => {
  try {
    const url = process.env.REDIS_URL;

    if (!url) {
      console.log("⚠️ No REDIS_URL provided → Redis disabled.");
      return;
    }

    redis = createClient({ url });

    redis.on("error", (err: Error) =>
      console.log(" Redis Error:", err.message)
    );

    await redis.connect();
    console.log(" Connected to Upstash Redis");
  } catch (err) {
    console.log(" Redis connection failed → running without Redis.");
  }
})();

export { redis };
