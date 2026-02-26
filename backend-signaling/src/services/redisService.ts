import Redis from "ioredis";
import type { CallCacheData, RedisEnvelope, ServerMessage } from "../types/signalling";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const makeClient = (name: string) => {
    const client = new Redis(REDIS_URL, {
        lazyConnect: false,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times) => Math.min(times * 200, 5000),
    });

    client.on("error", (err) => console.error(`[Redis:${name}]`, err.message));
    client.on("connect", () => console.log(`[Redis:${name}] connected`));

    return client;
};

export const redis = makeClient("main");
export const redisPub = makeClient("pub");
export const redisSub = makeClient("sub");

export const keys = {
    call: (roomId: string) => `call:${roomId}`,
    room: (roomId: string) => `room:${roomId}:participants`,
    peer: (roomId: string, userId: string) => `peer:${roomId}:${userId}`,
} as const;

export const CALL_TTL = 86_400;

export async function getCallCache(
    roomId: string
): Promise<CallCacheData | null> {
    const raw = await redis.get(keys.call(roomId));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as CallCacheData;
    } catch {
        return null;
    }
}

export async function setCallCache(
    roomId: string,
    data: CallCacheData
): Promise<void> {
    await redis.setex(keys.call(roomId), CALL_TTL, JSON.stringify(data));
}

export async function deleteCallCache(roomId: string): Promise<void> {
    await redis.del(keys.call(roomId));
}

export async function roomAdd(roomId: string, userId: string): Promise<void> {
    const key = keys.room(roomId);
    await redis.sadd(key, userId);
    await redis.expire(key, CALL_TTL);
}

export async function roomRemove(
    roomId: string,
    userId: string
): Promise<void> {
    await redis.srem(keys.room(roomId), userId);
}

export async function roomMembers(roomId: string): Promise<string[]> {
    return redis.smembers(keys.room(roomId));
}

const CHANNEL = (roomId: string) => `call:${roomId}`;

export async function publishToRoom(
    roomId: string,
    envelope: RedisEnvelope
): Promise<void> {
    await redisPub.publish(CHANNEL(roomId), JSON.stringify(envelope));
}

export function subscribeToRooms(
    handler: (roomId: string, envelope: RedisEnvelope) => void
): void {
    redisSub.psubscribe("call:*", (err) => {
        if (err) console.error("[Redis:sub] psubscribe error:", err);
        else console.log("[Redis:sub] subscribed to call:*");
    });

    redisSub.on("pmessage", (_pattern, channel, message) => {
        try {
            const roomId = channel.slice("call:".length);
            const envelope: RedisEnvelope = JSON.parse(message);
            handler(roomId, envelope);
        } catch (err) {
            console.error("[Redis:sub] message parse error:", err);
        }
    });
}

export async function closeRedis(): Promise<void> {
    await Promise.all([redis.quit(), redisPub.quit(), redisSub.quit()]);
}