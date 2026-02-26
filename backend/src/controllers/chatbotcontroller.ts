import { Request, Response } from "express";
import dotenv from "dotenv";
import { ChatHistory } from "../models/ChatHistory";
import { redisGet, redisSet, redisDel, isRedisAvailable } from "../utils/redisClient";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const getChatCacheKey = (userId: string): string => {
  return `app:chat:history:user:${userId}`;
};

const getConversationHistory = async (
  userId: string
): Promise<Array<{ role: string; parts: Array<{ text: string }> }>> => {
  try {
    if (isRedisAvailable()) {
      const cached = await redisGet(getChatCacheKey(userId));
      if (cached) {
        const messages = JSON.parse(cached);
        return messages.map((msg: any) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));
      }
    }

    const chatHistory = await ChatHistory.findOne({ userId });

    if (chatHistory?.messages?.length) {
      if (isRedisAvailable()) {
        await redisSet(
          getChatCacheKey(userId),
          JSON.stringify(chatHistory.messages),
          3600
        );
      }

      return chatHistory.messages.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));
    }

    return [];
  } catch {
    return [];
  }
};

const updateConversationCache = async (
  userId: string,
  userMessage: { sender: string; content: string },
  botMessage: { sender: string; content: string }
): Promise<void> => {
  if (!isRedisAvailable()) return;

  const cached = await redisGet(getChatCacheKey(userId));
  let messages = cached ? JSON.parse(cached) : [];

  messages.push(userMessage, botMessage);

  const MAX_MESSAGES = 50;
  messages = messages.slice(-MAX_MESSAGES);

  await redisSet(
    getChatCacheKey(userId),
    JSON.stringify(messages),
    3600
  );
};

const ALLOWED_LANGUAGES = new Set([
  'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Punjabi'
]);

export const chatbot = async (req: Request, res: Response): Promise<void> => {
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
      const userMessage = { sender: "user", content: message };
      const botMessage = { sender: "bot", content: botResponseText };

      await updateConversationCache(userId, userMessage, botMessage);

      await ChatHistory.findOneAndUpdate(
        { userId },
        {
          $push: { messages: { $each: [userMessage, botMessage] } },
          $setOnInsert: { userId }
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ reply: botResponseText });
  } catch (error: any) {
    res.status(502).json({
      error: "AI service failed",
      details: error?.message
    });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    if (isRedisAvailable()) {
      const cached = await redisGet(getChatCacheKey(userId));
      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }
    }

    const history = await ChatHistory.findOne({ userId });

    if (history?.messages) {
      if (isRedisAvailable()) {
        await redisSet(
          getChatCacheKey(userId),
          JSON.stringify(history.messages),
          3600
        );
      }
      res.status(200).json(history.messages);
    } else {
      res.status(200).json([]);
    }
  } catch {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    if (isRedisAvailable()) {
      await redisDel(getChatCacheKey(userId));
    }

    await ChatHistory.findOneAndUpdate(
      { userId },
      { $set: { messages: [] } }
    );

    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch {
    res.status(500).json({ error: "Failed to clear chat history" });
  }
};
