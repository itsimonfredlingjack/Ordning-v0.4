import { Message, MessageAuthor } from '../types';

// n8n webhook URL
const WEBHOOK_URL = 'https://n8n.fredlingautomation.dev/webhook/ordning-test';

export async function getChatCompletion(messages: Message[]): Promise<string> {
  // Get the last user message
  const lastUserMessage = messages.filter(msg => msg.author === MessageAuthor.USER).pop();

  if (!lastUserMessage) {
    return "Sorry, I couldn't find your message.";
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: lastUserMessage.text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("n8n webhook error:", errorData);
      throw new Error(`Failed to fetch response from n8n webhook: ${response.status}`);
    }

    // Try to parse as JSON first, fall back to plain text
    const contentType = response.headers.get('content-type');
    let responseText: string;

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      responseText = data.response || data.message || data.text || "Sorry, I couldn't generate a response.";
    } else {
      // Handle plain text response
      responseText = await response.text();
    }

    return responseText || "Sorry, I couldn't generate a response.";

  } catch (error) {
    console.error("Error calling n8n webhook:", error);
    throw error;
  }
}
