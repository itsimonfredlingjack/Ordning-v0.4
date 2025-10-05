
import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, SendIcon } from './Icons';
import WaveformVisualizer from './WaveformVisualizer';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { analyser, isInitializing, start, stop } = useAudioVisualizer();

  const handleMicClick = () => {
    if (isRecording) {
      stop();
      setIsRecording(false);
      // Simulate transcription and send a message
      onSendMessage("Tell me about the future of AI productivity tools.");
    } else {
      start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    // Stop recording if the component unmounts
    return () => {
      stop();
    };
  }, [stop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const placeholderText = isRecording ? "Listening..." : "Prata med ordning här...";

  return (
    <div className="relative w-full">
      {isRecording && <WaveformVisualizer analyser={analyser} />}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholderText}
          disabled={isLoading || isRecording}
          className="w-full pl-6 pr-28 py-4 bg-black/20 text-[#F5F5F5] placeholder:text-gray-500 rounded-full border border-white/10 focus:outline-none focus:ring-0 focus:border-[#9B59B6]/80 focus:shadow-[0_0_24px_0px_rgba(155,89,182,0.3)] transition-all duration-300"
        />
        <div className="absolute right-4 flex items-center space-x-2">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isInitializing}
            className={`p-2 rounded-full transition-all duration-300 group ${
              isRecording
                ? 'bg-[#9B59B6] text-white amethyst-glow-heavy animate-mic-pulse'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <MicrophoneIcon className={`w-6 h-6 transition-transform duration-300 ${!isRecording ? 'group-hover:scale-110' : ''}`} />
          </button>
          <button
            type="submit"
            disabled={isLoading || isRecording || !inputValue.trim()}
            className="p-2 rounded-full bg-[#9B59B6] text-white disabled:bg-gray-600 disabled:opacity-50 hover:bg-[#8e44ad] transition-all duration-300"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
