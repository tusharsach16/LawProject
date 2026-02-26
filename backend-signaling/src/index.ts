import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import { getIceServers } from "./turn";
import type { ClientMessage } from "./types/signalling";
import { connectionManager } from "./services/connectionManager";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Redis setup for horizontal scaling
const redis = new Redis(REDIS_URL);
const redisPub = new Redis(REDIS_URL);
const redisSub = new Redis(REDIS_URL);

redis.on("error", (err) => console.error("[Redis] Client error:", err));
redisPub.on("error", (err) => console.error("[Redis] Pub error:", err));
redisSub.on("error", (err) => console.error("[Redis] Sub error:", err));

interface CallTokenPayload {
    userId: string;
    appointmentId: string;
    callRoomId: string;
}

// Verify JWT token and extract user info
function verifyToken(token: string): CallTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as CallTokenPayload;
        return decoded;
    } catch (error) {
        console.error("[Auth] JWT verification failed:", error);
        return null;
    }
}

// Verify user has access to this call room (check appointment in Redis)
async function verifyCallAccess(
    userId: string,
    callRoomId: string
): Promise<{ allowed: boolean; appointmentId?: string }> {
    try {
        const cacheKey = `call:${callRoomId}`;
        const cached = await redis.get(cacheKey);

        if (!cached) {
            console.warn(`[Auth] Call room ${callRoomId} not found in cache`);
            return { allowed: false };
        }

        const data = JSON.parse(cached) as {
            appointmentId?: string;
            authorizedUsers?: string[];
            userId?: string;
            lawyerId?: string;
        };

        // Support both authorizedUsers array (new) and legacy userId/lawyerId fields
        const authorizedUsers: string[] =
            data.authorizedUsers ?? [data.userId, data.lawyerId].filter(Boolean) as string[];

        if (!authorizedUsers.includes(userId)) {
            console.warn(`[Auth] User ${userId} not authorized for room ${callRoomId}`);
            return { allowed: false };
        }

        return { allowed: true, appointmentId: data.appointmentId };
    } catch (error) {
        console.error("[Auth] Error verifying call access:", error);
        return { allowed: false };
    }
}

// Publish message to Redis so other server instances can forward it
async function publishToRedis(channel: string, message: object): Promise<void> {
    await redisPub.publish(channel, JSON.stringify(message));
}

// ─── Redis Pub/Sub: MUST use "pmessage" for psubscribe, not "message" ───
redisSub.on("pmessage", (_pattern: string, channel: string, rawMessage: string) => {
    try {
        const data = JSON.parse(rawMessage) as {
            targetUserId: string;
            payload: object;
            excludeUserId?: string;
        };
        const { targetUserId, payload, excludeUserId } = data;

        // Extract room ID from channel "call:{roomId}"
        const roomId = channel.split(":").slice(1).join(":");

        if (targetUserId === "broadcast") {
            connectionManager.broadcastToRoom(roomId, payload, excludeUserId);
        } else {
            connectionManager.sendIfLocal(targetUserId, payload);
        }
    } catch (error) {
        console.error("[Redis] Error processing pmessage:", error);
    }
});

// Pattern-subscribe to all call room channels
redisSub.psubscribe("call:*", (err, count) => {
    if (err) {
        console.error("[Redis] Subscription error:", err);
    } else {
        console.log(`[Redis] Subscribed to ${count} patterns`);
    }
});

// ─── Express REST API ───────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// CORS middleware — locked to known origins only
const ALLOWED_ORIGINS = new Set([
    "http://localhost:5173",
    "https://nyaysetu-psi.vercel.app",
    process.env.FRONTEND_URL,
].filter(Boolean) as string[]);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }
    next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        connections: connectionManager.size,
        timestamp: new Date().toISOString(),
    });
});

// ICE servers endpoint
app.get("/ice", async (_req, res) => {
    try {
        const iceServers = await getIceServers();
        res.json(iceServers);
    } catch (err) {
        console.error("[ICE] Error getting ICE servers:", err);
        res.status(500).json({ error: "Failed to get ICE servers" });
    }
});

// Cache call data endpoint — called by main backend when it cannot reach Redis directly
app.post("/cache-call", async (req, res) => {
    try {
        const { callRoomId, ...payload } = req.body as { callRoomId: string;[key: string]: unknown };
        if (!callRoomId) {
            res.status(400).json({ error: "callRoomId is required" });
            return;
        }
        await redis.setex(`call:${callRoomId}`, 86_400, JSON.stringify(payload));
        res.json({ ok: true });
    } catch (error) {
        console.error("[CacheCall] Error:", error);
        res.status(500).json({ error: "Failed to cache call data" });
    }
});

// Generate call token endpoint (legacy — prefer calling this from the main backend)
app.post("/generate-call-token", async (req, res) => {
    try {
        const { userId, appointmentId, callRoomId, lawyerId, duration } = req.body as {
            userId?: string;
            appointmentId?: string;
            callRoomId?: string;
            lawyerId?: string;
            duration?: number;
        };

        if (!userId || !appointmentId || !callRoomId || !lawyerId) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // Cache appointment details in Redis (24 hour TTL)
        await redis.setex(
            `call:${callRoomId}`,
            86_400,
            JSON.stringify({
                appointmentId,
                userId,
                lawyerId,
                authorizedUsers: [userId, lawyerId],
                duration,
                createdAt: new Date().toISOString(),
            })
        );

        const token = jwt.sign(
            { userId, appointmentId, callRoomId },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token });
    } catch (error) {
        console.error("[GenerateToken] Error:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
});

// ─── WebSocket Server ───────────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
    console.log("[WS] New connection attempt");

    let userId: string | null = null;
    let callRoomId: string | null = null;

    ws.on("error", (error) => {
        console.error("[WS] WebSocket error:", error);
    });

    ws.on("message", async (raw) => {
        try {
            const msg: ClientMessage = JSON.parse(raw.toString());

            // First message must be authentication
            if (!userId && msg.type !== "authenticate") {
                ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
                ws.close();
                return;
            }

            switch (msg.type) {
                case "authenticate": {
                    const auth = verifyToken(msg.token);
                    if (!auth) {
                        ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
                        ws.close();
                        return;
                    }

                    const access = await verifyCallAccess(auth.userId, auth.callRoomId);
                    if (!access.allowed) {
                        ws.send(JSON.stringify({ type: "error", message: "Unauthorized access" }));
                        ws.close();
                        return;
                    }

                    userId = auth.userId;
                    callRoomId = auth.callRoomId;

                    // Register connection in connection manager
                    connectionManager.add(userId, callRoomId, ws);


                    ws.send(JSON.stringify({ type: "authenticated", userId, callRoomId }));

                    // Add user to Redis room participants set
                    const roomKey = `room:${callRoomId}:participants`;
                    await redis.sadd(roomKey, userId);
                    await redis.expire(roomKey, 86_400);

                    // Get other participants already in the room
                    const participants = await redis.smembers(roomKey);
                    const otherParticipants = participants.filter((id) => id !== userId);

                    if (otherParticipants.length > 0) {
                        ws.send(JSON.stringify({ type: "existing_participants", participants: otherParticipants }));
                    } else {
                        ws.send(JSON.stringify({ type: "waiting_for_peer" }));
                    }

                    // Notify existing participants about new joiner via Redis pub/sub
                    await publishToRedis(`call:${callRoomId}`, {
                        targetUserId: "broadcast",
                        payload: { type: "peer_joined", otherUserId: userId },
                        excludeUserId: userId,
                    });

                    break;
                }

                case "heartbeat": {
                    if (userId) {
                        connectionManager.touch(userId);
                        ws.send(JSON.stringify({ type: "heartbeat_ack", serverTime: Date.now() }));
                    }
                    break;
                }

                case "offer":
                case "answer":
                case "ice-candidate": {
                    if (!userId || !callRoomId) {
                        ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
                        return;
                    }

                    // Try local delivery first (avoid Redis round-trip if same server)
                    const delivered = connectionManager.sendIfLocal(msg.to, msg);
                    if (!delivered) {
                        // Target is on a different server instance — publish via Redis
                        await publishToRedis(`call:${callRoomId}`, {
                            targetUserId: msg.to,
                            payload: msg,
                        });
                    }
                    break;
                }

                default: {
                    console.warn("[WS] Unknown message type:", (msg as Record<string, unknown>).type);
                }
            }
        } catch (error) {
            console.error("[WS] Error processing message:", error);
            ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
        }
    });

    ws.on("close", async () => {
        if (userId && callRoomId) {
            console.log(`[WS] User ${userId} disconnected from room ${callRoomId}`);

            connectionManager.remove(userId);

            const roomKey = `room:${callRoomId}:participants`;
            await redis.srem(roomKey, userId);

            await publishToRedis(`call:${callRoomId}`, {
                targetUserId: "broadcast",
                payload: { type: "peer_disconnected", userId },
                excludeUserId: userId,
            });
        }
    });
});

// Prune stale connections every 60 seconds
setInterval(() => {
    const pruned = connectionManager.pruneStale(90_000); // 90 s timeout
    if (pruned.length > 0) {
        console.log(`[Prune] Removed ${pruned.length} stale connection(s): ${pruned.join(", ")}`);
    }
}, 60_000);

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("[Server] SIGTERM received, shutting down gracefully");

    await redis.quit();
    await redisPub.quit();
    await redisSub.quit();

    server.close(() => {
        console.log("[Server] HTTP server closed");
        process.exit(0);
    });
});

server.listen(PORT, () => {
    console.log(`[Server] Scalable WebRTC signaling server running on port ${PORT}`);
    console.log(`[Redis] Connected to ${REDIS_URL}`);
});