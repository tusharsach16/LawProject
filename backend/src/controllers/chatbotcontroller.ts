import { Request, Response } from "express";
import dotenv from "dotenv";
import { ChatHistory } from "../models/ChatHistory";
import { redisGet, redisSet, redisDel, isRedisAvailable } from "../utils/redisClient";
import { AuthenticatedRequest } from "../types/express";
import {
  encryptMessage,
  decryptMessage,
  resolveStoredMessage,
  ENCRYPTION_VERSION
} from "../utils/cryptoUtils";
dotenv.config();

const getChatCacheKey = (userId: string, version: number): string => {
  return `app:chat:v3:history:user:${userId}:${version}`;
};

const getConversationHistory = async (
  userId: string
): Promise<Array<{ role: string; parts: Array<{ text: string }> }>> => {
  try {
    const versionDoc = await ChatHistory.findOne({ userId }, { historyVersion: 1 });
    if (!versionDoc) {
      return [];
    }

    const currentVersion = versionDoc.historyVersion ?? 0;

    if (isRedisAvailable()) {
      const cacheKey = getChatCacheKey(userId, currentVersion);
      const cached = await redisGet(cacheKey);
      if (cached) {
        try {
          const decryptedPayload = decryptMessage(cached);
          const messages = JSON.parse(decryptedPayload);
          return messages.map((msg: any) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          }));
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error("Failed to decrypt conversation cache from Redis; clearing invalid key:", error.message);
          await redisDel(cacheKey);
        }
      }
    }

    const chatHistory = await ChatHistory.findOne({ userId });

    if (chatHistory?.messages?.length) {
      const decryptedMessages = chatHistory.messages.map((msg: any) => ({
        sender: msg.sender,
        content: resolveStoredMessage(msg),
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }));

      const docVersion = chatHistory.historyVersion ?? 0;
      if (isRedisAvailable() && docVersion === currentVersion) {
        const encryptedCache = encryptMessage(JSON.stringify(decryptedMessages));
        await redisSet(
          getChatCacheKey(userId, docVersion),
          encryptedCache,
          3600
        );
      }

      return decryptedMessages.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));
    }

    return [];
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Conversation history retrieval failed:", error.message);
    throw error;
  }
};

const ALLOWED_LANGUAGES = new Set([
  'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Punjabi',
  'Bengali', 'Gujarati', 'Kannada', 'Malayalam'
]);

export const chatbot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { message, language } = req.body;
  const replyLanguage = ALLOWED_LANGUAGES.has(language) ? language : 'English';
  const userId = req.user?.id;
  const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  if (!GOOGLE_GEMINI_API_KEY) {
    res.status(500).json({ error: "Gemini API key missing" });
    return;
  }

  try {
    const systemPrompt = `You are an expert AI Legal Assistant specialized in Indian Law. Only answer legal questions related to India. Always respond in ${replyLanguage}, regardless of the language the user writes in — even if they write in Hinglish, Hindi, or any other language, always reply only in ${replyLanguage}. Always end personal case answers with: "This is an AI-generated answer. Please consult a qualified lawyer before taking any action."`;

    let conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (userId) {
      conversationHistory = await getConversationHistory(userId);
    }

    conversationHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    conversationHistory = conversationHistory.slice(-20);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;

    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: conversationHistory,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(data?.error?.message || "Gemini API failed");
    }

    const botResponseText = data.candidates[0].content.parts[0].text;

    if (userId) {
      const encryptedUserMessage = {
        sender: "user",
        content: encryptMessage(message),
        encryptionVersion: ENCRYPTION_VERSION
      };
      const encryptedBotMessage = {
        sender: "bot",
        content: encryptMessage(botResponseText),
        encryptionVersion: ENCRYPTION_VERSION
      };

      const updatedHistory = await ChatHistory.findOneAndUpdate(
        { userId },
        {
          $push: { messages: { $each: [encryptedUserMessage, encryptedBotMessage] } },
          $inc: { historyVersion: 1 },
          $setOnInsert: { userId }
        },
        { upsert: true, new: true }
      );

      if (isRedisAvailable() && updatedHistory) {
        const newVersion = updatedHistory.historyVersion ?? 1;
        const previousVersion = newVersion - 1;
        await redisDel(getChatCacheKey(userId, previousVersion));
      }
    }

    res.status(200).json({ reply: botResponseText });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Chatbot operation failed:", error.message);
    res.status(502).json({
      error: "AI service failed"
    });
  }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const versionDoc = await ChatHistory.findOne({ userId }, { historyVersion: 1 });
    if (!versionDoc) {
      res.status(200).json([]);
      return;
    }

    const currentVersion = versionDoc.historyVersion ?? 0;

    if (isRedisAvailable()) {
      const cacheKey = getChatCacheKey(userId, currentVersion);
      const cached = await redisGet(cacheKey);
      if (cached) {
        try {
          const decryptedPayload = decryptMessage(cached);
          const messages = JSON.parse(decryptedPayload);
          const sanitizedMessages = messages.map((msg: any) => ({
            sender: msg.sender,
            content: msg.content,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
          }));
          res.status(200).json(sanitizedMessages);
          return;
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error("Failed to decrypt chat history cache from Redis; clearing invalid key:", error.message);
          await redisDel(cacheKey);
        }
      }
    }

    const history = await ChatHistory.findOne({ userId });

    if (history?.messages) {
      const decryptedMessages = history.messages.map((msg: any) => ({
        sender: msg.sender,
        content: resolveStoredMessage(msg),
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      }));

      const docVersion = history.historyVersion ?? 0;
      if (isRedisAvailable() && docVersion === currentVersion) {
        const encryptedCache = encryptMessage(JSON.stringify(decryptedMessages));
        await redisSet(
          getChatCacheKey(userId, docVersion),
          encryptedCache,
          3600
        );
      }
      res.status(200).json(decryptedMessages);
    } else {
      res.status(200).json([]);
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Chat history retrieval failed:", error.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

export const clearChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const updatedHistory = await ChatHistory.findOneAndUpdate(
      { userId },
      {
        $set: { messages: [] },
        $inc: { historyVersion: 1 }
      },
      { new: true }
    );

    if (isRedisAvailable() && updatedHistory) {
      const newVersion = updatedHistory.historyVersion ?? 1;
      const previousVersion = newVersion - 1;
      await redisDel(getChatCacheKey(userId, previousVersion));
      await redisDel(getChatCacheKey(userId, newVersion));
    }

    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Failed to clear chat history:", error.message);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
};
