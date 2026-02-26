import type WebSocket from "ws";

interface ConnectionEntry {
    ws: WebSocket;
    userId: string;
    callRoomId: string;
    connectedAt: number;
    lastHeartbeat: number;
}

class ConnectionManager {
    private readonly byUserId = new Map<string, ConnectionEntry>();

    add(userId: string, callRoomId: string, ws: WebSocket): void {
        this.byUserId.set(userId, {
            ws,
            userId,
            callRoomId,
            connectedAt: Date.now(),
            lastHeartbeat: Date.now(),
        });
    }

    remove(userId: string): void {
        this.byUserId.delete(userId);
    }

    get(userId: string): ConnectionEntry | undefined {
        return this.byUserId.get(userId);
    }

    touch(userId: string): void {
        const entry = this.byUserId.get(userId);
        if (entry) entry.lastHeartbeat = Date.now();
    }

    sendIfLocal(userId: string, payload: object): boolean {
        const entry = this.byUserId.get(userId);
        if (!entry) return false;

        const { ws } = entry;
        if (ws.readyState !== ws.OPEN) {
            this.byUserId.delete(userId);
            return false;
        }

        ws.send(JSON.stringify(payload));
        return true;
    }

    broadcastToRoom(
        roomId: string,
        payload: object,
        excludeUserId?: string
    ): void {
        for (const [uid, entry] of this.byUserId) {
            if (uid === excludeUserId || entry.callRoomId !== roomId) continue;
            if (entry.ws.readyState !== entry.ws.OPEN) {
                this.byUserId.delete(uid);
                continue;
            }
            entry.ws.send(JSON.stringify(payload));
        }
    }

    get size(): number {
        return this.byUserId.size;
    }

    pruneStale(maxAgeMs = 60_000): string[] {
        const pruned: string[] = [];
        const now = Date.now();
        for (const [uid, entry] of this.byUserId) {
            if (now - entry.lastHeartbeat > maxAgeMs) {
                entry.ws.terminate();
                this.byUserId.delete(uid);
                pruned.push(uid);
            }
        }
        return pruned;
    }
}

export const connectionManager = new ConnectionManager();