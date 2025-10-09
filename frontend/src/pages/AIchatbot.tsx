import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader, Scale, Mic } from 'lucide-react';
import { askAiAssistant } from '../services/authService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'legal-advice';
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

interface VoiceRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: ((this: VoiceRecognition, ev: Event) => any) | null;
  onresult: ((this: VoiceRecognition, ev: any) => any) | null;
  onend: ((this: VoiceRecognition, ev: Event) => any) | null;
  onerror: ((this: VoiceRecognition, ev: any) => any) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => VoiceRecognition;
    SpeechRecognition: new () => VoiceRecognition;
  }
}

const AiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Legal Assistant. How can I assist you with Indian law today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResponseEnabled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const currentSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTranscriptRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('ai_conversations');
    const savedActive = localStorage.getItem('ai_active_conversation');
    if (saved) {
      const parsed: Conversation[] = JSON.parse(saved);
      setConversations(parsed.map((c: Conversation) => ({
        ...c,
        messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }))
      })));
      if (savedActive) {
        setActiveConversationId(savedActive);
        const active: Conversation | undefined = JSON.parse(saved).find((c: Conversation) => c.id === savedActive);
        if (active) {
          setMessages(active.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })));
          setShowWelcome(active.messages.length === 0);
        }
      }
    } else {
      const initialConv: Conversation = {
        id: Date.now().toString(),
        title: 'Conversation',
        updatedAt: Date.now(),
        messages: [
          {
            id: '1',
            content: "Hello! I'm your AI Legal Assistant. How can I assist you with Indian law today?",
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          }
        ]
      };
      setConversations([initialConv]);
      setActiveConversationId(initialConv.id);
      setMessages(initialConv.messages);
      localStorage.setItem('ai_conversations', JSON.stringify([initialConv]));
      localStorage.setItem('ai_active_conversation', initialConv.id);
    }
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    setConversations(prev => {
      const next = prev.map(c => c.id === activeConversationId ? { ...c, messages, updatedAt: Date.now() } : c);
      localStorage.setItem('ai_conversations', JSON.stringify(next));
      return next;
    });
  }, [messages, activeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('ai_active_conversation', activeConversationId);
    }
  }, [activeConversationId]);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'Conversation',
      updatedAt: Date.now(),
      messages: [
        {
          id: `${Date.now()}-bot-welcome`,
          content: "Hello! I'm your AI Legal Assistant. How can I assist you with Indian law today?",
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
      ]
    };
    setConversations(prev => {
      const next = [newConv, ...prev];
      localStorage.setItem('ai_conversations', JSON.stringify(next));
      return next;
    });
    setActiveConversationId(newConv.id);
    setMessages(newConv.messages);
    setShowWelcome(false);
    setShowHistoryList(false);
  };

  const openHistoryList = () => {
    setShowHistoryList(true);
  };

  const closeHistoryList = () => {
    setShowHistoryList(false);
  };

  const loadHistoryConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    setActiveConversationId(id);
    setMessages(conv.messages);
    setShowWelcome(conv.messages.length === 0);
    setShowHistoryList(false);
  };

  const deriveTitleFromFirstUserMessage = (conv: Conversation): string => {
    const firstUser = conv.messages.find(m => m.sender === 'user');
    const text = firstUser?.content || '';
    const clean = text.replace(/<[^>]*>/g, ' ').trim();
    return clean ? (clean.length > 40 ? clean.slice(0, 40) + '…' : clean) : 'Conversation';
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
    } else if ('SpeechRecognition' in window) {
      recognitionRef.current = new (window as any).SpeechRecognition()
    } else {
      return false
    }

    const recognition = recognitionRef.current
    if (!recognition) return false
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
      lastTranscriptRef.current = ''
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript
      }
      lastTranscriptRef.current = transcript
      setInput(transcript)
    }

    recognition.onend = () => {
      setIsRecording(false)
      const finalTranscript = lastTranscriptRef.current.trim()
      if (finalTranscript) {
        handleSendMessage(finalTranscript)
      }
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    return true
  }

  const speakText = (text: string) => {
    if (!voiceResponseEnabled || !text) return
    speechSynthesis.cancel()
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/⚠️.*$/g, '').replace(/\s+/g, ' ').trim()
    if (!cleanText) return
    const utterance = new SpeechSynthesisUtterance(cleanText)
    currentSpeechRef.current = utterance
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    const voices = speechSynthesis.getVoices()
    const preferred = voices.filter(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Microsoft')))
    if (preferred.length > 0) utterance.voice = preferred[0]
    utterance.onend = () => { currentSpeechRef.current = null }
    utterance.onerror = () => { currentSpeechRef.current = null }
    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    currentSpeechRef.current = null
  }

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
        return
      }
    }
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      if (currentSpeechRef.current) {
        stopSpeaking()
      }
      recognitionRef.current?.start()
    }
  }

  useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
      }
  }, [input])

  const handleSendMessage = async (predefinedQuery?: string) => {
    const currentInput = predefinedQuery || input;
    if (!currentInput.trim()) return;

    if (currentSpeechRef.current) {
      speechSynthesis.cancel();
      stopSpeaking();
    }

    setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAiAssistant(currentInput);
      const botResponseText = response.reply;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'legal-advice'
      };
      setMessages(prev => [...prev, botMessage]);
      setConversations(prev => {
        const next = prev.map(c => {
          if (c.id !== activeConversationId) return c;
          const updated = { ...c, messages: [...c.messages, userMessage, botMessage], updatedAt: Date.now() };
          const title = c.title === 'Conversation' ? deriveTitleFromFirstUserMessage(updated) : c.title;
          return { ...updated, title };
        });
        localStorage.setItem('ai_conversations', JSON.stringify(next));
        return next;
      });
      speakText(botMessage.content);

    } catch (error) {
      console.error("API call to backend failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const quickActions = [
      { title: "📄 Contract Review", description: "Get help reviewing contracts...", action: "I need help reviewing a contract..." },
      { title: "⚖️ Know Your Rights", description: "Learn about your legal rights...", action: "What are my basic legal rights as a consumer?" },
      { title: "🏢 Business Legal Help", description: "Guidance on business formation...", action: "I'm starting a business, what are the legal steps?" },
      { title: "👨‍👩‍👧‍👦 Family Law", description: "Assistance with family law matters...", action: "What is the procedure for divorce in India?" },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="p-5 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Legal AI Assistant</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-emerald-600 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Online
          </div>
          <button onClick={createNewConversation} className="ml-3 px-3 py-1.5 text-sm rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">New Chat</button>
          <button onClick={openHistoryList} className="px-3 py-1.5 text-sm rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">History</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {showHistoryList && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Your conversations</h2>
              <button onClick={closeHistoryList} className="px-3 py-1.5 text-sm rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50">Close</button>
            </div>
            {conversations.length === 0 && (
              <div className="text-slate-600 text-sm">No history yet.</div>
            )}
            {conversations.length > 0 && (
              <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
                {conversations
                  .slice()
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((item) => (
                  <button key={item.id} onClick={() => loadHistoryConversation(item.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{item.title || 'Conversation'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{(item.messages.find(m => m.sender === 'user')?.content || item.messages[0]?.content || '').slice(0, 80) || 'Conversation'}</div>
                      </div>
                      {item.updatedAt && <div className="text-xs text-slate-400">{new Date(item.updatedAt).toLocaleString()}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {!showHistoryList && showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Scale size={48} className="text-yellow-500 mb-4"/>
            <h1 className="text-3xl font-bold text-slate-800 mb-3">LegalAssist AI</h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl">Your intelligent legal companion for information on Indian Law.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              {quickActions.map((action, index) => (
                <div key={index} onClick={() => handleQuickAction(action.action)} className="p-5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all text-left">
                  <h3 className="font-semibold text-slate-800 mb-2">{action.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showHistoryList && !showWelcome && (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Scale size={16} className="text-white" />
                  </div>
                )}
                <div className={`max-w-2xl p-4 rounded-2xl ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white border text-slate-800 rounded-bl-md shadow-sm'}`}>
                  <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}></div>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"><Scale size={16} className="text-white" /></div>
                <div className="bg-white border p-4 rounded-2xl rounded-bl-md shadow-sm"><Loader className="w-4 h-4 animate-spin text-blue-600" /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-5 bg-white/90 backdrop-blur-lg border-t border-slate-200/80">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Indian law..."
            className="w-full min-h-[50px] px-5 pr-24 py-3 border-2 border-slate-200 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none bg-white shadow-sm"
            disabled={isLoading}
            rows={1}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading} className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100">
              <Send className="w-4 h-4" />
            </button>
            <button onClick={toggleVoiceRecording} disabled={isLoading} className="w-9 h-9 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
            This AI provides general legal information only. Always consult a qualified lawyer for specific legal advice.
        </p>
      </div>
      
    </div>
  )
}

export default AiChatbot;

