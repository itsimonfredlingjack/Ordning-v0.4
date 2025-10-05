import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message, Task, CalendarEvent, MessageAuthor } from './types';
import ChatMessage from './components/ChatMessage';
import FocusWindow from './components/FocusWindow';
import ChatInput from './components/ChatInput';
import MobileEventHeader from './components/MobileEventHeader';
import { createChat } from './services/geminiService';
import { Chat } from '@google/genai';

// Mock Data
const initialTasks: Task[] = [
  { id: '1', text: 'Finalize Q3 report slides', completed: false },
  { id: '2', text: 'Send follow-up to Project Phoenix team', completed: false },
  { id: '3', text: 'Review new ORDNING UI mockups', completed: true },
];

const getNextEvent = (): CalendarEvent => {
    const now = new Date();
    // Set event to be 3 hours and 45 minutes from now
    const eventTime = new Date(now.getTime() + 3 * 60 * 60 * 1000 + 45 * 60 * 1000 + 15 * 1000);
    return {
        title: 'Product Strategy Sync',
        time: eventTime
    };
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { id: '1', text: 'Welcome to ORDNING. How can I assist you today?', author: MessageAuthor.AI }
  ]);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [nextEvent, setNextEvent] = useState<CalendarEvent>(getNextEvent());
  const [isLoading, setIsLoading] = useState(false);
  
  const chatInstance = useMemo<Chat | null>(() => {
    try {
      return createChat();
    } catch (e) {
      console.error(e);
      // Display error message in chat
      setMessages(prev => [...prev, {
          id: 'error-init',
          text: 'Error: Could not initialize AI chat. Please check your API key.',
          author: MessageAuthor.AI
      }]);
      return null;
    }
  }, []);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!chatInstance) {
        console.error("Chat not initialized.");
        return;
    }
    
    const userMessage: Message = {
      id: String(Date.now()),
      text,
      author: MessageAuthor.USER,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatInstance.sendMessage({ message: text });
      const aiMessage: Message = {
        id: String(Date.now() + 1),
        text: response.text,
        author: MessageAuthor.AI,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        text: "Sorry, I encountered an error. Please try again.",
        author: MessageAuthor.AI,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 lg:p-10">
      {/* Background Lighting Effect */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#9B59B6]/10 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#9B59B6]/5 to-transparent blur-3xl"></div>

      <main className="w-full h-full max-w-7xl mx-auto flex gap-8">
        {/* Left Pane: Chat Interface */}
        <div className="flex-[7] flex flex-col h-full min-h-0">
          {/* Mobile Header: Visible only on smaller screens */}
          <div className="block lg:hidden">
            <MobileEventHeader event={nextEvent} />
          </div>

          <div className="flex-1 overflow-y-auto pr-4" ref={chatContainerRef}>
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6">
                 <div className="max-w-xl px-5 py-3 rounded-2xl bg-white/5 amethyst-hairline">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#9B59B6] rounded-full animate-pulse delay-0"></div>
                    <div className="w-2 h-2 bg-[#9B59B6] rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-[#9B59B6] rounded-full animate-pulse delay-300"></div>
                  </div>
                 </div>
              </div>
            )}
          </div>
          <div className="mt-auto pt-6">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Pane: Focus Window */}
        <div className="flex-[3] h-full hidden lg:block">
          <FocusWindow tasks={tasks} event={nextEvent} />
        </div>
      </main>
    </div>
  );
};

export default App;
