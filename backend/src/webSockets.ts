import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import url from "url";
import jwt from "jsonwebtoken";
import { MockTrial } from "./models/Mocktrial/Mock";
import mongoose from "mongoose";

const trialRooms = new Map<string, Map<string, WebSocket>>();

export const initWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req: any) => {
    const parameters = url.parse(req.url, true).query;
    const trialId = parameters.trialId as string;
    const token = parameters.token as string;

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch (e) {
      console.error("WebSocket Auth error");
      ws.close(1008, "Invalid token");
      return;
    }

    if (!trialRooms.has(trialId)) {
      trialRooms.set(trialId, new Map());
    }

    trialRooms.get(trialId)?.set(userId, ws);
    console.log(`User ${userId} connected to trial room ${trialId}`);
    console.log(`Current participants in trial ${trialId}:`, Array.from(trialRooms.get(trialId)?.keys() || []));

    ws.on("message", async (message: WebSocket.RawData) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        const participants = trialRooms.get(trialId);

        if (participants) {
          // Save message to database first
          try {
            const trial = await MockTrial.findById(trialId);
            if (trial) {
              const messageData = {
                senderId: new mongoose.Types.ObjectId(userId),
                text: parsedMessage.text,
                timestamp: new Date(),
              };
              
              // Check message limit
              if (trial.messages.length >= 200) {
                console.log("Trial has reached maximum messages");
                return;
              }
              
              trial.messages.push(messageData);
              await trial.save();
              console.log("Message saved to database");
            }
          } catch (dbError) {
            console.error("Failed to save message to database:", dbError);
          }

          participants.forEach((client, clientId) => {
            if (client.readyState === WebSocket.OPEN) {
              const payload = {
                type: 'message',
                from: userId,
                trialId,
                data: {
                  ...parsedMessage,
                  senderId: userId,
                  timestamp: new Date().toISOString()
                },
                timestamp: Date.now(),
              };
              client.send(JSON.stringify(payload));
            }
          });
          
          console.log(`Message broadcasted to ${participants.size} participants in trial ${trialId}`);
        }
      } catch (e) {
        console.log("Failed to process message:", e);
      }
    });

    ws.on("close", () => {
      const room = trialRooms.get(trialId);
      if (room) {
        room.delete(userId);
        console.log(`User ${userId} disconnected from trial room ${trialId}`);

        if (room.size === 0) {
          trialRooms.delete(trialId);
          console.log(`Trial room ${trialId} is now empty and has been closed`);
        }
      }
    });

    ws.on("error", (error) => {
      console.log("WebSocket error:", error);
    });
  });

  console.log("WebSocket server initialised");
};
