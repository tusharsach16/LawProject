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
    console.log(` Closing all connections for trial ${trialId}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Participants: ${room.size}`);
    
    room.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'error', 
          message: reason 
        }));
        client.close(1008, reason);
        console.log(`   Closed connection for user ${userId}`);
      }
    });
    
    room.clear();
    trialRooms.delete(trialId);
    console.log(` Trial room ${trialId} deleted`);
  }
};

export const broadcastToTrialRoom = (trialId: string, payload: any) => {
  const room = trialRooms.get(trialId);
  
  console.log(' broadcastToTrialRoom called');
  console.log('   Trial ID:', trialId);
  console.log('   Payload type:', payload.type);
  console.log('   Room exists:', !!room);
  console.log('   Room size:', room?.size || 0);
  
  if (room) {
    console.log('   Participants in room:', Array.from(room.keys()));
    
    let sentCount = 0;
    room.forEach((client, userId) => {
      console.log(`   Checking client ${userId}, readyState:`, client.readyState);
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
        sentCount++;
        console.log(`   Sent to user ${userId}`);
      } else {
        console.log(`   Client ${userId} not ready, state: ${client.readyState}`);
      }
    });
    
    console.log(` Broadcast complete: sent to ${sentCount}/${room.size} clients`);
  } else {
    console.log(' No room found for trial', trialId);
    console.log('   Available rooms:', Array.from(trialRooms.keys()));
  }
};

export const initWebSocketServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: any) => {
    const parameters = url.parse(req.url, true).query;
    const trialId = parameters.trialId as string;
    const token = parameters.token as string;

    console.log(' New WebSocket connection attempt');
    console.log('   Trial ID:', trialId);

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
      console.log(' User authenticated:', userId);
    } catch (e) {
      console.error(" WebSocket Auth error");
      ws.close(1008, "Invalid token");
      return;
    }

    // Check trial status before allowing connection
    try {
      const trial = await MockTrial.findById(trialId);
      
      if (!trial) {
        console.log(" Trial not found, closing connection");
        ws.send(JSON.stringify({ type: 'error', message: 'Trial not found.' }));
        ws.close(1008, "Trial not found");
        return;
      }

      // Reject connection if trial has ended or been left
      if (trial.status !== 'active') {
        console.log(` Trial is not active (status: ${trial.status}), closing connection`);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: `Trial has ${trial.status === 'ended' ? 'ended' : 'been left'}.` 
        }));
        ws.close(1008, `Trial ${trial.status}`);
        return;
      }

      console.log(' Trial is active, allowing connection');
    } catch (e) {
      console.error(" Error checking trial status:", e);
      ws.send(JSON.stringify({ type: 'error', message: 'Error checking trial status.' }));
      ws.close(1008, "Error checking trial");
      return;
    }

    if (!trialRooms.has(trialId)) {
      trialRooms.set(trialId, new Map());
      console.log(' Created new room for trial:', trialId);
    }

    trialRooms.get(trialId)?.set(userId, ws);
    console.log(` User ${userId} added to trial room ${trialId}`);
    console.log(`   Current participants:`, Array.from(trialRooms.get(trialId)?.keys() || []));

    ws.on("message", async (message: WebSocket.RawData) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        const participants = trialRooms.get(trialId);

        console.log(' Message received from user:', userId);
        console.log('   Message type:', parsedMessage.type);

        if (participants) {
          const trial = await MockTrial.findById(trialId);
          
          if (!trial) {
             console.log(" Trial not found");
             ws.send(JSON.stringify({ type: 'error', message: 'Trial not found.' }));
             return; 
          }

          // Handle 'leave' message type
          if (parsedMessage.type === 'leave') {
            console.log(' User leaving via WebSocket:', userId);
            
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
            
            console.log(` Broadcasting leave notification to other participants`);
            participants.forEach((client, clientId) => {
              // Don't send to the user who is leaving
              if (clientId !== userId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leavePayload));
                console.log(`  Sent leave notification to ${clientId}`);
              }
            });
            
            return;
          }

          // Check if trial is still active before allowing messages
          if (trial.status !== 'active') {
            console.log(" Trial not active, status:", trial.status);
            ws.send(JSON.stringify({ type: 'error', message: 'Trial has ended.' }));
            return;
          }

          // Check message limit
          if (trial.messages.length >= 200) {
            console.log(" Message limit reached");
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

          console.log(' Message saved to database');

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
          
          console.log(` Broadcasting message to ${participants.size} participants`);
          participants.forEach((client, clientId) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(payload));
              console.log(`   ✅ Sent to ${clientId}`);
            }
          });
        }
      } catch (e) {
        console.error(" Message Error:", e);
      }
    });

    ws.on("close", () => {
      const room = trialRooms.get(trialId);
      if (room) {
        room.delete(userId);
        console.log(` User ${userId} disconnected from trial room ${trialId}`);
        console.log(`   Remaining participants: ${room.size}`);

        if (room.size === 0) {
          trialRooms.delete(trialId);
          console.log(`Trial room ${trialId} deleted (empty)`);
        }
      }
    });

    ws.on("error", (error) => {
      console.log("WebSocket error:", error);
    });
  });

  console.log("WebSocket server initialized");
};