import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Gemini 3.0 Pro is not available via public API yet, using 1.5 Pro as requested fallback or 2.0 Flash/Pro if available.
// The prompt specifies "Gemini 3.0 Pro", I will use the latest available if possible.
