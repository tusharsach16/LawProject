import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({model: "models/gemini-2.5-flash"});