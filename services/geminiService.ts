
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChat(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are ORDNING, a sophisticated AI productivity assistant. Your responses should be concise, elegant, and helpful. You format your answers clearly, sometimes using markdown for lists or emphasis.',
    },
  });
}
