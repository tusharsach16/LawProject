import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { ChatHistory } from '../models/ChatHistory';

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

export const chatbot = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;
  const userId = req.user?.id;
  const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

  console.log('=== CHATBOT REQUEST DEBUG ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', userId);
  console.log('Message:', message);
  console.log('API Key exists:', !!GOOGLE_GEMINI_API_KEY);
  console.log('API Key length:', GOOGLE_GEMINI_API_KEY?.length);

  if (!message) {
    console.log('Error: Message is required');
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  if (!GOOGLE_GEMINI_API_KEY) {
    console.log('Error: Gemini API key is not configured');
    res.status(500).json({ 
      error: 'Gemini API key is not configured on the server',
      details: 'Please add GOOGLE_GEMINI_API_KEY to environment variables' 
    });
    return;
  }

  try {
    const systemPrompt = `You are an expert AI Legal Assistant specialized in Indian Law. Your role is to provide clear, accurate, and concise information about legal topics in India.

Rules:
1. Strictly Legal: Only answer questions related to Indian law, legal procedures, rights, and statutes.
2. Refuse Non-Legal Queries: If asked about personal opinions, feelings, or any non-legal topic, you MUST politely decline.
3. Mandatory Disclaimer: If a user discusses a personal case, you MUST conclude your response with the exact disclaimer: "⚠️ This is an AI-generated answer. Please consult a qualified lawyer before taking any action."`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    console.log("Sending request to Gemini API...");
    console.log("Model: gemini-2.5-flash");

    let geminiResponse;
    let data;

    try {
      geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log("Gemini Response Status:", geminiResponse.status, geminiResponse.statusText);

      data = await geminiResponse.json();

      if (!geminiResponse.ok) {
        console.error('Gemini API Error Response:', JSON.stringify(data, null, 2));
        const errorMessage = data?.error?.message || data?.error || `Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`;
        
        if (geminiResponse.status === 400) {
          throw new Error(`Invalid request to Gemini API: ${errorMessage}`);
        } else if (geminiResponse.status === 401) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        } else if (geminiResponse.status === 403) {
          throw new Error('Access forbidden. Please check your Gemini API key permissions.');
        } else if (geminiResponse.status === 429) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        } else if (geminiResponse.status === 500) {
          throw new Error('Gemini API server error. Please try again later.');
        }
        
        throw new Error(errorMessage);
      }

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected Gemini API Response Structure:', JSON.stringify(data, null, 2));
        
        if (data.candidates?.[0]?.finishReason === 'SAFETY') {
          throw new Error('Response was blocked due to safety filters. Please rephrase your question.');
        }
        
        if (data.candidates?.[0]?.finishReason === 'RECITATION') {
          throw new Error('Response blocked due to potential copyright content. Please rephrase your question.');
        }
        
        throw new Error('Invalid response from Gemini API - no content generated');
      }

      console.log('Successfully received response from Gemini');
      
    } catch (fetchError: any) {
      console.error('Error calling Gemini API:', fetchError);
      
      if (fetchError.message.includes('fetch') || fetchError.code === 'ENOTFOUND') {
        throw new Error('Network error: Unable to reach Gemini API. Please check your internet connection.');
      }
      
      throw fetchError;
    }

    const botResponseText: string = data.candidates[0].content.parts[0].text;
    console.log('Bot Response Length:', botResponseText.length, 'characters');

    if (userId) {
      try {
        const userMessage = {
          sender: 'user' as const,
          content: message,
        };
        const botMessage = {
          sender: 'bot' as const,
          content: botResponseText,
        };

        await ChatHistory.findOneAndUpdate(
          { userId },
          {
            $push: { messages: { $each: [userMessage, botMessage] } },
            $setOnInsert: { userId },
          },
          { upsert: true, new: true }
        );
        
        console.log('Chat history saved to database');
      } catch (dbError: any) {
        console.error('Warning: Failed to save chat history:', dbError.message);
      }
    } else {
      console.log('No userId - skipping chat history save (guest user)');
    }

    console.log('=== CHATBOT REQUEST SUCCESS ===\n');
    res.status(200).json({ reply: botResponseText });
    
  } catch (error: any) {
    console.error("=== CHATBOT REQUEST FAILED ===");
    console.error("Error message:", error?.message || error);
    console.error("Error stack:", error?.stack);
    console.error("=================================\n");

    const errorMessage = error?.message || 'Unknown error occurred';
    const statusCode = error?.message?.includes('API key') ? 500 : 
                       error?.message?.includes('rate limit') ? 429 : 
                       error?.message?.includes('Invalid request') ? 400 :
                       error?.message?.includes('Network error') ? 503 : 500;

    res.status(statusCode).json({
      error: 'Failed to get response from AI',
      details: errorMessage,
      message: errorMessage,
    });
  }
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  console.log('=== GET CHAT HISTORY ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', userId);

  if (!userId) {
    console.log('Unauthorized: No user ID');
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const history = await ChatHistory.findOne({ userId });

    if (history?.messages) {
      console.log('Found chat history:', history.messages.length, 'messages');
      res.status(200).json(history.messages);
    } else {
      console.log('No chat history found for user');
      res.status(200).json([]);
    }
  } catch (e: any) {
    console.error("Error fetching history:", e.message);
    console.error(e.stack);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
