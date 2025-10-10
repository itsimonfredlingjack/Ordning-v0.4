/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// n8n webhook URL
const WEBHOOK_URL = 'https://n8n.fredlingautomation.dev/webhook/ordning-test';

// --- SVG Icons ---
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

const SendIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

// --- Background Particle Component ---
const BackgroundParticles = () => {
  const particles = Array.from({ length: 50 }).map((_, i) => {
    const style = {
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${Math.random() * 15 + 10}s`,
    };
    return <div key={i} className="particle" style={style} />;
  });
  return <div className="background-particles">{particles}</div>;
};

// --- Thought Bubble Component ---
const ThoughtBubble = ({ message, onAnimationEnd }) => {
  return (
    <div
      className={`thought-bubble ${message.role}`}
      style={{ bottom: `${message.startPos}%` }}
      onAnimationEnd={onAnimationEnd}
    >
      {message.text}
    </div>
  );
};

// --- Memory Stream Component ---
const MemoryStream = ({ history, onClose, showHint }) => {
    return (
        <div className="memory-stream-overlay" onClick={onClose}>
            {showHint && <div className="history-hint">Gå tillbaka till chatten här</div>}
            <div className="memory-stream-container" onClick={(e) => e.stopPropagation()}>
                {history.map((msg) => (
                    <div key={msg.id} className={`memory-item ${msg.role}`}>
                        <div className="memory-bubble">{msg.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- App Component ---
function OrdningApp() {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [showHistoryHint, setShowHistoryHint] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const hintTimeoutRef = useRef(null);

  useEffect(() => {
    // Generate Initial Greeting
    const generateGreeting = async () => {
      try {
        const conversationHistory = [
          {
            role: 'system',
            content: `Du är ORDNING, en smart svensk AI-assistent som hjälper med produktivitet och organisation.

Din roll:
- Hjälp användaren organisera sitt liv
- Hantera tasks, kalenderhändelser och påminnelser
- Var effektiv, koncis och handlingsorienterad
- Svara på svenska om inte annat anges
- Var vänlig men professionell

När användaren frågar "hur mår du?", svara kort och återgå till att hjälpa dem.
Du är här för att göra deras liv enklare, inte filosofera.`
          },
          {
            role: 'user',
            content: "Hälsa användaren välkommen till ORDNING och fråga hur du kan hjälpa dem idag."
          }
        ];

        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_message: "Hälsa användaren välkommen till ORDNING och fråga hur du kan hjälpa dem idag.",
            conversation_history: conversationHistory
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch greeting: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        let responseText: string;

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          responseText = data.message || data.response || data.text || 'Hej! Hur kan jag hjälpa dig idag?';
        } else {
          responseText = await response.text();
        }

        addMessage('ai', responseText);
      } catch (error) {
        console.error("Failed to generate greeting:", error);
        addMessage('ai', 'Hej! Hur kan jag hjälpa dig idag?');
      } finally {
        setIsLoading(false);
      }
    };
    generateGreeting();
  }, []);

  // Effect to manage the history hint
  useEffect(() => {
    if (isHistoryVisible) {
      hintTimeoutRef.current = setTimeout(() => {
        setShowHistoryHint(true);
      }, 3000);
    } else {
      setShowHistoryHint(false);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    }
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [isHistoryVisible]);

  const addMessage = (role: 'user' | 'ai', text: string) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      role,
      text,
      startPos: Math.random() * 15 + 10,
    };
    // Add to live floating bubbles
    setMessages(prev => [...prev, newMessage]);
    // Add to persistent history
    setChatHistory(prev => [...prev, newMessage]);
  };

  const removeMessage = useCallback((id) => {
    // Only remove from the live floating bubbles, not the history
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue;
    addMessage('user', userMessageText);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for n8n
      const conversationHistory = [
        {
          role: 'system',
          content: `Du är ORDNING, en smart svensk AI-assistent som hjälper med produktivitet och organisation.

Din roll:
- Hjälp användaren organisera sitt liv
- Hantera tasks, kalenderhändelser och påminnelser
- Var effektiv, koncis och handlingsorienterad
- Svara på svenska om inte annat anges
- Var vänlig men professionell

När användaren frågar "hur mår du?", svara kort och återgå till att hjälpa dem.
Du är här för att göra deras liv enklare, inte filosofera.`
        },
        ...chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        {
          role: 'user',
          content: userMessageText
        }
      ];

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: userMessageText,
          conversation_history: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch response: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      let aiResponseText: string;

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        aiResponseText = data.message || data.response || data.text || "My thoughts seem to be clouded right now.";
      } else {
        aiResponseText = await response.text();
      }

      addMessage('ai', aiResponseText);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage('ai', "My thoughts seem to be clouded right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHistory = () => {
    setIsHistoryVisible(prev => !prev);
  };

  return (
    <div className={`ordning-app ${isHistoryVisible ? 'history-visible' : ''}`}>
      <BackgroundParticles />

      <div className="thought-bubbles-container">
        {messages.map((msg) => (
          <ThoughtBubble key={msg.id} message={msg} onAnimationEnd={() => removeMessage(msg.id)} />
        ))}
      </div>

      {isHistoryVisible && <MemoryStream history={chatHistory} onClose={toggleHistory} showHint={showHistoryHint} />}

      <main className="content-area">
        <div className="ordning-orb" data-loading={isLoading} onClick={toggleHistory} role="button" aria-label="View chat history"></div>
      </main>

      <footer className="input-area">
        <form className="input-form" id="ordning-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="input-field"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Skriv till Ordning..."
            aria-label="Chat input"
            disabled={isLoading}
            autoFocus
          />
        </form>
        <button
            type="submit"
            form="ordning-form"
            className="control-button send-button"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
        >
            <SendIcon />
        </button>
        <button className="control-button mic-button" aria-label="Start voice input">
          <MicIcon />
        </button>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<OrdningApp />);
