
import React from 'react';
import { Message, MessageAuthor } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.author === MessageAuthor.AI;

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl transition-all duration-300 ${
          isAI
            ? 'bg-white/5 amethyst-hairline text-left'
            : 'bg-black/20 text-right'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed font-normal">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
