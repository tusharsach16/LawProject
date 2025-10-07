import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { ChatHistory } from '../models/ChatHistory';
import mongoose from 'mongoose';

dotenv.config();

export const chatbot = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;
  const userId = (req as any).user?.id;
  const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
}
  if (!GOOGLE_GEMINI_API_KEY) {
    res.status(500).json({ error: 'Gemini API key is not configured on the server' });
    return;
}

  try {
    const systemPrompt = `You are an expert AI Legal Assistant specialized in Indian Law. Your role is to provide clear, accurate, and concise information about legal topics in India.

    Rules:
    1.  **Strictly Legal:** Only answer questions related to Indian law, legal procedures, rights, and statutes.
    2.  **Refuse Non-Legal Queries:** If asked about personal opinions, feelings, or any non-legal topic, you MUST politely decline.
    3.  **Mandatory Disclaimer:** If a user discusses a personal case, you MUST conclude your response with the exact disclaimer: "⚠️ This is an AI-generated answer. Please consult a qualified lawyer before taking any action."`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;

    const payload = {
      contents: [{ parts: [{ text: message }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
        throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();
    const botResponseText = data.candidates[0].content.parts[0].text;

    if (userId) {
        const userMessage = { sender: 'user' as const, content: message };
        const botMessage = { sender: 'bot' as const, content: botResponseText };

        await ChatHistory.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId) },
            { 
                $push: { messages: { $each: [userMessage, botMessage] } },
                $setOnInsert: { userId: new mongoose.Types.ObjectId(userId) }
            },
            { upsert: true, new: true }
        );
    }

    res.status(200).json({ reply: botResponseText });

  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if(!userId) {
        res.status(401).json({error: "Unauthorised"});
        return;
    } 

    try {
        const history = await ChatHistory.findOne({userId: new mongoose.Types.ObjectId(userId)});
        if(history) {
            res.status(200).json(history.messages);
            return;
        } else {
            res.status(200).json([]);
        }
    } catch(e) {
        console.log("Error fetching history: ", e);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
}