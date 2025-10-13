import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Loader, Scale, Mic, Plus, History, X, MessageSquare, Sparkles, Shield, BookOpen, Users as UsersIcon, Building } from 'lucide-react';
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
      { icon: Shield, title: "Contract Review", description: "Get help reviewing contracts and legal documents", action: "I need help reviewing a contract..." },
      { icon: Scale, title: "Know Your Rights", description: "Learn about your legal rights and obligations", action: "What are my basic legal rights as a consumer?" },
      { icon: Building, title: "Business Legal Help", description: "Guidance on business formation and compliance", action: "I'm starting a business, what are the legal steps?" },
      { icon: UsersIcon, title: "Family Law", description: "Assistance with family law matters", action: "What is the procedure for divorce in India?" },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-amber-500/20 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-xl">
            <Scale className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Legal AI Assistant</h1>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Online & Ready
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={createNewConversation} 
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 hover:border-amber-500/50 transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Chat</span>
          </button>
          <button 
            onClick={openHistoryList} 
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 flex items-center gap-2"
          >
            <History size={16} />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* History List */}
        {showHistoryList && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <History className="h-6 w-6 text-amber-500" />
                Your Conversations
              </h2>
              <button 
                onClick={closeHistoryList} 
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300 flex items-center gap-2"
              >
                <X size={16} />
                Close
              </button>
            </div>
            {conversations.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No conversation history yet.</p>
              </div>
            )}
            {conversations.length > 0 && (
              <div className="space-y-3">
                {conversations
                  .slice()
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((item, index) => (
                  <button 
                    key={item.id} 
                    onClick={() => loadHistoryConversation(item.id)} 
                    className="w-full text-left p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 group"
                    style={{
                      animation: `slideInHistory 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <div className="text-base font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                            {item.title || 'Conversation'}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 line-clamp-2">
                          {(item.messages.find(m => m.sender === 'user')?.content || item.messages[0]?.content || 'Conversation').slice(0, 120)}
                        </div>
                      </div>
                      {item.updatedAt && (
                        <div className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Welcome Screen */}
        {!showHistoryList && showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-3xl shadow-2xl">
                <Scale size={64} className="text-white"/>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
              LegalAssist AI
              <Sparkles className="h-8 w-8 text-amber-500" />
            </h1>
            <p className="text-lg text-slate-600 mb-12 max-w-2xl">
              Your intelligent legal companion for information on Indian Law. Ask me anything!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div 
                    key={index} 
                    onClick={() => handleQuickAction(action.action)} 
                    className="p-6 bg-white border-2 border-slate-200 rounded-2xl cursor-pointer hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 text-left group"
                    style={{
                      animation: `slideInQuick 0.5s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {!showHistoryList && !showWelcome && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: `slideInMessage 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                {message.sender === 'bot' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Scale size={20} className="text-white" />
                  </div>
                )}
                <div className={`max-w-2xl p-5 rounded-2xl shadow-sm ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-br-md' 
                    : 'bg-white border-2 border-slate-200 text-slate-800 rounded-bl-md'
                }`}>
                  <div 
                    className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none" 
                    dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}
                  ></div>
                </div>
                {message.sender === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Scale size={20} className="text-white" />
                </div>
                <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl rounded-bl-md shadow-sm">
                  <Loader className="w-5 h-5 animate-spin text-amber-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-5 bg-white border-t-2 border-slate-200">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Indian law..."
            className="w-full min-h-[56px] px-6 pr-28 py-4 border-2 border-slate-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none resize-none bg-white shadow-sm text-slate-900 placeholder-slate-400"
            disabled={isLoading}
            rows={1}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading} 
              className="w-11 h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={toggleVoiceRecording} 
              disabled={isLoading} 
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 text-center">
          <Shield className="inline h-3 w-3 mr-1" />
          This AI provides general legal information only. Always consult a qualified lawyer for specific legal advice.
        </p>
      </div>
    </div>
  )
}

export default AiChatbot;