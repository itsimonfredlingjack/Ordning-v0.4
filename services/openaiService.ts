import { Message, MessageAuthor } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set for OpenAI");
}

const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.API_KEY;

// Map our internal MessageAuthor enum to OpenAI's role strings
const roleMap = {
  [MessageAuthor.USER]: 'user',
  [MessageAuthor.AI]: 'assistant',
};

export async function getChatCompletion(messages: Message[]): Promise<string> {
  const formattedMessages = messages.map(msg => ({
    role: roleMap[msg.author],
    content: msg.text,
  }));

  const systemMessage = {
      role: 'system',
      content: 'You are ORDNING, a sophisticated AI productivity assistant. Your responses should be concise, elegant, and helpful. You format your answers clearly, sometimes using markdown for lists or emphasis.'
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...formattedMessages],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(errorData.error?.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
