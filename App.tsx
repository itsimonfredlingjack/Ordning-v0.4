import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Check, Calendar } from 'lucide-react';
import { getChatCompletion } from './services/openaiService';

enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

interface Message {
  id: string;
  text: string;
  author: MessageAuthor;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface CalendarEvent {
  title: string;
  time: Date;
}

interface DayEvent {
  time: string;
  title: string;
}

const initialTasks: Task[] = [
  { id: '1', text: 'Finalize Q3 report slides', completed: false },
  { id: '2', text: 'Send follow-up to Project Phoenix team', completed: false },
  { id: '3', text: 'Review new ORDNING UI mockups', completed: true },
];

const todayEvents: DayEvent[] = [
  { time: '09:00', title: 'Team Standup' },
  { time: '11:30', title: 'Client Review Call' },
  { time: '14:00', title: 'Product Strategy Sync' },
  { time: '16:30', title: 'Design Workshop' },
];

const getNextEvent = (): CalendarEvent => {
  const now = new Date();
  const eventTime = new Date(now.getTime() + 3 * 60 * 60 * 1000 + 45 * 60 * 1000);
  return {
    title: 'Product Strategy Sync',
    time: eventTime
  };
};

// ORDNING Logo Component - Circle with Checkmark (O with completion)
const OrdningLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#C084FC', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#9B59B6', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Outer circle - the "O" */}
    <circle
      cx="50"
      cy="50"
      r="38"
      stroke="url(#logoGrad)"
      strokeWidth="4"
      fill="none"
      filter="url(#glow)"
    />

    {/* Inner glow circle */}
    <circle
      cx="50"
      cy="50"
      r="30"
      stroke="url(#logoGrad)"
      strokeWidth="2"
      fill="none"
      opacity="0.4"
    />

    {/* Background circle for checkmark */}
    <circle
      cx="50"
      cy="50"
      r="22"
      fill="url(#logoGrad)"
      opacity="0.15"
    />

    {/* Checkmark - bold and clean */}
    <path
      d="M 38 50 L 46 58 L 64 38"
      stroke="#F5F5F5"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      filter="url(#softGlow)"
    />
  </svg>
);

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void }> = ({ task, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onToggle(task.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        borderRadius: '10px',
        cursor: 'pointer',
        border: `1px solid ${isHovered ? 'rgba(155, 89, 182, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0px 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <p style={{
        fontWeight: '500',
        fontSize: '15px',
        color: task.completed ? '#6B7280' : '#E5E7EB',
        textDecoration: task.completed ? 'line-through' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {task.text}
      </p>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        border: task.completed ? '2px solid #9B59B6' : '2px solid #6B7280',
        backgroundColor: task.completed ? '#9B59B6' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
      }}>
        {task.completed && <Check style={{ width: '16px', height: '16px', color: 'white', strokeWidth: 3 }} />}
      </div>
    </div>
  );
};

const MiniCalendar: React.FC = () => {
  const today = new Date();
  const dayName = today.toLocaleDateString('sv-SE', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '18px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      marginBottom: '24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
      }}>
        <Calendar style={{ width: '18px', height: '18px', color: '#9B59B6' }} />
        <div>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#E5E7EB',
            margin: 0,
            textTransform: 'capitalize',
          }}>{dayName}</h3>
          <p style={{
            fontSize: '13px',
            color: '#9CA3AF',
            margin: 0,
            textTransform: 'capitalize',
          }}>{dateStr}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {todayEvents.map((event, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              borderLeft: '2px solid #9B59B6',
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#9B59B6',
              minWidth: '48px',
            }}>{event.time}</span>
            <span style={{
              fontSize: '14px',
              color: '#E5E7EB',
            }}>{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const useCountdown = (targetDate: Date) => {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = { hours: '00', minutes: '00', seconds: '00' };

    if (difference > 0) {
      timeLeft = {
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0'),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
};

const FocusWindow: React.FC<{ tasks: Task[]; event: CalendarEvent; onTaskToggle: (id: string) => void }> = ({ tasks, event, onTaskToggle }) => {
  const timeLeft = useCountdown(event.time);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      padding: '32px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(24px)',
      borderRadius: '16px',
      boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflowY: 'auto',
    }}>
      <h2 style={{
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.15em',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>NÄSTA HÄNDELSE</h2>
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize: '18px',
          color: 'white',
          fontWeight: '600',
          marginBottom: '4px',
        }}>{event.title}</p>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          color: '#9B59B6',
        }}>
          <span style={{ fontSize: '56px', fontWeight: '600', letterSpacing: '-0.03em', lineHeight: '1' }}>{timeLeft.hours}</span>
          <span style={{ fontSize: '24px', opacity: 0.75, fontWeight: '500' }}>h</span>
          <span style={{ fontSize: '56px', fontWeight: '600', letterSpacing: '-0.03em', lineHeight: '1' }}>{timeLeft.minutes}</span>
          <span style={{ fontSize: '24px', opacity: 0.75, fontWeight: '500' }}>m</span>
          <span style={{ fontSize: '56px', fontWeight: '600', letterSpacing: '-0.03em', lineHeight: '1' }}>{timeLeft.seconds}</span>
          <span style={{ fontSize: '24px', opacity: 0.75, fontWeight: '500' }}>s</span>
        </div>
      </div>

      <MiniCalendar />

      <h2 style={{
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.15em',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: '16px',
      }}>PRIORITERADE TASKS</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onToggle={onTaskToggle} />
        ))}
      </div>
    </div>
  );
};

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isAI = message.author === MessageAuthor.AI;

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      marginBottom: '24px',
      justifyContent: isAI ? 'flex-start' : 'flex-end',
      alignItems: 'flex-start',
      gap: '12px',
    }}>
      {isAI && (
        <div style={{
          flexShrink: 0,
          marginTop: '4px',
        }}>
          <OrdningLogo size={32} />
        </div>
      )}
      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: '16px',
        backgroundColor: isAI ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.2)',
        backdropFilter: isAI ? 'blur(12px)' : 'none',
        textAlign: isAI ? 'left' : 'right',
        borderLeft: isAI ? '2px solid #9B59B6' : 'none',
        boxShadow: isAI ? 'inset 3px 0px 8px -4px rgba(155, 89, 182, 0.6)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <p style={{
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          fontWeight: '400',
          fontSize: '15px',
          color: '#F5F5F5',
          margin: 0,
        }}>{message.text}</p>
      </div>
    </div>
  );
};

const ChatInput: React.FC<{ onSendMessage: (message: string) => void; isLoading: boolean }> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleMicClick = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        onSendMessage("Berätta om framtiden för AI-produktivitetsverktyg.");
      }, 2000);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isRecording ? "Lyssnar..." : "Prata med ORDNING här..."}
          disabled={isLoading || isRecording}
          style={{
            width: '100%',
            padding: '16px 112px 16px 24px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: '#F5F5F5',
            fontSize: '15px',
            borderRadius: '9999px',
            border: `1px solid ${isFocused ? 'rgba(155, 89, 182, 0.8)' : 'rgba(255, 255, 255, 0.1)'}`,
            outline: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isFocused ? '0 0 24px 0px rgba(155, 89, 182, 0.3)' : 'none',
          }}
        />
        <div style={{
          position: 'absolute',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isRecording}
            style={{
              padding: '8px',
              borderRadius: '9999px',
              backgroundColor: isRecording ? '#9B59B6' : 'transparent',
              color: isRecording ? 'white' : '#9CA3AF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isRecording ? '0 0 24px 4px rgba(155, 89, 182, 0.5)' : 'none',
              animation: isRecording ? 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isRecording) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRecording) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }
            }}
          >
            <Mic style={{ width: '24px', height: '24px' }} />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || isRecording || !inputValue.trim()}
            style={{
              padding: '8px',
              borderRadius: '9999px',
              backgroundColor: '#9B59B6',
              color: 'white',
              border: 'none',
              cursor: (isLoading || isRecording || !inputValue.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: (isLoading || isRecording || !inputValue.trim()) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!(isLoading || isRecording || !inputValue.trim())) {
                e.currentTarget.style.backgroundColor = '#8e44ad';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9B59B6';
            }}
          >
            <Send style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileEventHeader: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const timeLeft = useCountdown(event.time);

  return (
    <div style={{
      width: '100%',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(24px)',
      borderRadius: '16px',
      boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{
            fontSize: '10px',
            fontWeight: '600',
            letterSpacing: '0.15em',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}>NÄSTA HÄNDELSE</h2>
          <p style={{
            fontSize: '16px',
            color: 'white',
            fontWeight: '600',
            margin: 0,
          }}>{event.title}</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          color: '#9B59B6',
        }}>
          <span style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.03em', lineHeight: '1' }}>{timeLeft.hours}</span>
          <span style={{ fontSize: '14px', opacity: 0.75 }}>h</span>
          <span style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.03em', lineHeight: '1' }}>{timeLeft.minutes}</span>
          <span style={{ fontSize: '14px', opacity: 0.75 }}>m</span>
        </div>
      </div>

      {/* Mini calendar on mobile */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {todayEvents.slice(0, 3).map((event, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              borderLeft: '2px solid #9B59B6',
              minWidth: '120px',
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#9B59B6',
            }}>{event.time}</span>
            <span style={{
              fontSize: '12px',
              color: '#E5E7EB',
              marginTop: '2px',
            }}>{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1E1E24',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      zIndex: 9999,
    }}>
      <div style={{ animation: 'fadeInScale 1s ease-out' }}>
        <OrdningLogo size={120} />
      </div>
      <div style={{
        textAlign: 'center',
        animation: 'fadeIn 1s ease-out 0.5s both',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: 'white',
          margin: 0,
          letterSpacing: '0.05em',
        }}>ORDNING</h1>
        <p style={{
          fontSize: '16px',
          color: '#9CA3AF',
          margin: '12px 0 0 0',
          fontWeight: '300',
          letterSpacing: '0.08em',
        }}>Struktur. Intelligens.</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', text: 'Välkommen till ORDNING. Hur kan jag hjälpa dig idag?', author: MessageAuthor.AI }
  ]);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [nextEvent] = useState<CalendarEvent>(getNextEvent());
  const [isLoading, setIsLoading] = useState(false);

  // Force desktop view in artifact for development/preview
  const isLargeScreen = true;

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTaskToggle = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: String(Date.now()),
      text,
      author: MessageAuthor.USER,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Call OpenAI API through the existing service
      const aiResponse = await getChatCompletion(newMessages.slice(1));
      const aiMessage: Message = {
        id: String(Date.now() + 1),
        text: aiResponse,
        author: MessageAuthor.AI,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("OpenAI API error:", error);
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        text: "Förlåt, jag stötte på ett fel. Kontrollera konsolen eller försök igen.",
        author: MessageAuthor.AI,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: '#1E1E24',
      backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMUUxRTI0Ij48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMzMzMiPjwvcmVjdD4KPC9zdmc+')`,
      color: '#F5F5F5',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Cinematic Ambient Lighting */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle at top right, rgba(155, 89, 182, 0.1), transparent)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '33%',
        height: '33%',
        background: 'radial-gradient(circle at bottom left, rgba(155, 89, 182, 0.05), transparent)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <main style={{
        width: '100%',
        height: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        gap: '32px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left Pane: Chat Interface */}
        <div style={{
          flex: '7',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        }}>

          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '16px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(155, 89, 182, 0.3) transparent',
            }}
          >
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flexShrink: 0, marginTop: '4px' }}>
                  <OrdningLogo size={32} />
                </div>
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  borderLeft: '2px solid #9B59B6',
                  boxShadow: 'inset 3px 0px 8px -4px rgba(155, 89, 182, 0.6)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#9B59B6',
                          borderRadius: '50%',
                          animation: `pulse 1s ease-in-out infinite`,
                          animationDelay: `${delay}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Right Pane: Focus Window */}
        <div style={{ flex: '3', height: '100%' }}>
          <FocusWindow tasks={tasks} event={nextEvent} onTaskToggle={handleTaskToggle} />
        </div>
      </main>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;
