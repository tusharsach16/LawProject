import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import url from "url";
import jwt from "jsonwebtoken";
import { MockTrial } from "./models/Mocktrial/Mock";
import mongoose from "mongoose";

const trialRooms = new Map<string, Map<string, WebSocket>>();

export const closeTrialRoomConnections = (trialId: string, reason: string = 'Trial ended') => {
  const room = trialRooms.get(trialId);

  if (room) {
    room.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'error',
          message: reason
        }));
        client.close(1008, reason);
      }
    });

    room.clear();
    trialRooms.delete(trialId);
  }
};

export const broadcastToTrialRoom = (trialId: string, payload: any) => {
  const room = trialRooms.get(trialId);

  if (room) {
    room.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  }
};

export const initWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: any) => {
    const parameters = url.parse(req.url, true).query;
    const trialId = parameters.trialId as string;
    const token = parameters.token as string;

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch (e) {
      console.error(" WebSocket Auth error");
      ws.close(1008, "Invalid token");
      return;
    }

    // Check trial status before allowing connection
    try {
      const trial = await MockTrial.findById(trialId);

      if (!trial) {
        ws.send(JSON.stringify({ type: 'error', message: 'Trial not found.' }));
        ws.close(1008, "Trial not found");
        return;
      }

      // Reject connection if trial has ended or been left
      if (trial.status !== 'active') {
        ws.send(JSON.stringify({
          type: 'error',
          message: `Trial has ${trial.status === 'ended' ? 'ended' : 'been left'}.`
        }));
        ws.close(1008, `Trial ${trial.status}`);
        return;
      }
    } catch (e) {
      console.error(" Error checking trial status:", e);
      ws.send(JSON.stringify({ type: 'error', message: 'Error checking trial status.' }));
      ws.close(1008, "Error checking trial");
      return;
    }

    if (!trialRooms.has(trialId)) {
      trialRooms.set(trialId, new Map());
    }

    trialRooms.get(trialId)?.set(userId, ws);

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 25000); // every 25s

    ws.on("pong", () => { /* keep-alive acknowledged */ });

    ws.on("message", async (message: WebSocket.RawData) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        const participants = trialRooms.get(trialId);


        if (participants) {
          const trial = await MockTrial.findById(trialId);

          if (!trial) {
            ws.send(JSON.stringify({ type: 'error', message: 'Trial not found.' }));
            return;
          }

          // Handle 'leave' message type
          if (parsedMessage.type === 'leave') {
            // Broadcast to other users in the room (excluding the leaving user)
            const leavePayload = {
              type: 'system',
              message: 'The other participant has left the trial.',
              data: {
                senderId: 'system',
                text: 'The other participant has left the trial.',
                timestamp: new Date().toISOString()
              }
            };

            participants.forEach((client, clientId) => {
              if (clientId !== userId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leavePayload));
              }
            });

            return;
          }

          // Check if trial is still active before allowing messages
          if (trial.status !== 'active') {
            ws.send(JSON.stringify({ type: 'error', message: 'Trial has ended.' }));
            return;
          }

          // Check message limit
          if (trial.messages.length >= 200) {
            ws.send(JSON.stringify({ type: 'error', message: 'Message limit reached.' }));
            return;
          }

          const messageData = {
            senderId: new mongoose.Types.ObjectId(userId),
            text: parsedMessage.text,
            timestamp: new Date(),
          };

          trial.messages.push(messageData);
          await trial.save();

          // Broadcast to everyone in the room
          const payload = {
            type: 'message',
            trialId,
            data: {
              ...parsedMessage,
              senderId: userId,
              timestamp: new Date().toISOString()
            }
          };

          participants.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(payload));
            }
          });
        }
      } catch (e) {
        console.error(" Message Error:", e);
      }
    });

    ws.on("close", () => {
      clearInterval(pingInterval);
      const room = trialRooms.get(trialId);
      if (room) {
        room.delete(userId);
        if (room.size === 0) {
          trialRooms.delete(trialId);
        }
      }
    });


    ws.on("error", (error) => {
      console.error("[WS] WebSocket error:", error);
    });
  });
};