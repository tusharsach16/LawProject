"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const redis_1 = require("redis");
exports.redis = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
(async () => {
    try {
        await exports.redis.connect();
        console.log("Redis connected ✅");
    }
    catch (err) {
        console.error("Redis connection failed:", err);
    }
})();
