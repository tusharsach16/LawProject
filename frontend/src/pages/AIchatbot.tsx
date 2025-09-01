// src/pages/AiChatbot.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Send, User, Loader, Scale, Mic, Volume2, VolumeX, Square } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'legal-advice' | 'case-reference'
}

interface VoiceRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onstart: ((this: VoiceRecognition, ev: Event) => any) | null
  onresult: ((this: VoiceRecognition, ev: any) => any) | null
  onend: ((this: VoiceRecognition, ev: Event) => any) | null
  onerror: ((this: VoiceRecognition, ev: any) => any) | null
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => VoiceRecognition
    SpeechRecognition: new () => VoiceRecognition
  }
}

const AiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Legal Assistant. I can help you with legal questions, case law research, and provide general legal guidance. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<VoiceRecognition | null>(null)
  const currentSpeechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    initializeSpeechRecognition()
    return () => {
      if (currentSpeechRef.current) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  const quickQuestions = [
    "What is IPC Section 302?",
    "How to file an FIR?",
    "Property rights in India",
    "Consumer protection laws",
    "Divorce procedure in India",
    "Bail application process"
  ]

  const quickActions = [
    {
      title: "📄 Contract Review",
      description: "Get help reviewing contracts, agreements, and legal documents",
      action: "I need help reviewing a contract. Can you guide me through the key things to look for?"
    },
    {
      title: "⚖️ Know Your Rights",
      description: "Learn about your legal rights in various situations",
      action: "What are my basic legal rights as a consumer/employee/tenant?"
    },
    {
      title: "🏢 Business Legal Help",
      description: "Guidance on business formation, compliance, and regulations",
      action: "I'm starting a business. What legal requirements should I be aware of?"
    },
    {
      title: "👨‍👩‍👧‍👦 Family Law",
      description: "Assistance with family law matters and procedures",
      action: "I have questions about family law procedures. Can you help?"
    }
  ]

  // Speech Recognition Functions
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition()
    } else if ('SpeechRecognition' in window) {
      recognitionRef.current = new window.SpeechRecognition()
    } else {
      console.warn('Speech recognition not supported')
      return false
    }

    const recognition = recognitionRef.current
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (input.trim()) {
        handleSendMessage()
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    return true
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
      // Stop any current speech
      if (currentSpeechRef.current) {
        speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      recognitionRef.current?.start()
    }
  }

  // Text-to-Speech Functions
  const toggleVoiceResponse = () => {
    setVoiceResponseEnabled(!voiceResponseEnabled)
    if (voiceResponseEnabled && currentSpeechRef.current) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const speakText = (text: string) => {
    if (!voiceResponseEnabled || !text) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    // Clean text for speech (remove HTML tags and disclaimer)
    const cleanText = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/⚠️.*$/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    currentSpeechRef.current = utterance
    
    // Configure speech settings
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // Try to use a more professional voice
    const voices = speechSynthesis.getVoices()
    const preferredVoices = voices.filter(voice => 
      voice.lang.startsWith('en-') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    )
    
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0]
    }

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      currentSpeechRef.current = null
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      currentSpeechRef.current = null
    }

    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
    currentSpeechRef.current = null
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [input])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Stop any current speech
    if (currentSpeechRef.current) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }

    setShowWelcome(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    // Simulate API response (replace with actual API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateLegalResponse(currentInput),
        sender: 'bot',
        timestamp: new Date(),
        type: 'legal-advice'
      }
      setMessages(prev => [...prev, botMessage])
      setIsLoading(false)
      
      // Speak the response if voice is enabled
      speakText(botMessage.content)
    }, 1500 + Math.random() * 1000)
  }

  const generateLegalResponse = (userMessage: string): string => {
    const responses = [
      "Based on legal precedents and current regulations, here's what you need to know: Contract law requires clear offer, acceptance, and consideration. The terms must be definite and the parties must have legal capacity to enter into the agreement.",
      "According to the relevant laws and statutes, I can help you understand that: Employment rights vary by jurisdiction, but generally include fair wages, safe working conditions, and protection against discrimination based on protected characteristics.",
      "From a legal perspective, this situation involves several important considerations: Property law establishes ownership rights, transfer procedures, and tenant protections. Documentation and proper recording are essential for legal validity.",
      "Let me break down the legal aspects of your question: Business formation requires choosing the right entity type, registering with appropriate authorities, obtaining necessary licenses, and maintaining proper corporate governance."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           "\n\n⚠️ Disclaimer: This AI assistant provides general legal information only and does not constitute legal advice. Please consult with a qualified attorney for specific legal matters."
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startNewChat = () => {
    // Stop any current speech
    if (currentSpeechRef.current) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your AI Legal Assistant. I can help you with legal questions, case law research, and provide general legal guidance. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
    ])
    setShowWelcome(true)
    setInput('')
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-blue-900 to-blue-800 overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/95 backdrop-blur-lg">
        {/* Header */}
        <div className="p-5 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-800">Legal AI Assistant</h1>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Welcome Screen */}
          {showWelcome && (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <h1 className="text-3xl font-bold text-slate-800 mb-3">Welcome to LegalAssist AI</h1>
              <p className="text-lg text-slate-600 mb-10">Your intelligent legal companion for consultations, document review, and legal guidance</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="p-5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all text-left"
                  >
                    <h3 className="font-semibold text-slate-800 mb-2">{action.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{action.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {!showWelcome && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">LA</span>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-2xl p-4 rounded-2xl animate-fadeIn ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md'
                        : message.type === 'legal-advice'
                        ? 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-md shadow-sm'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {message.sender === 'bot' && message.type === 'legal-advice' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800">Legal Information</span>
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                    
                    <div className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">LA</span>
                  </div>
                  <div className="bg-white border border-slate-200/80 p-4 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-slate-600">LegalAssist is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Speaking indicator */}
              {isSpeaking && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-fadeIn">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800 text-sm">AI is speaking...</span>
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={stopSpeaking}
                    className="ml-2 p-1 text-emerald-600 hover:text-emerald-800"
                  >
                    <Square className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 bg-white/90 backdrop-blur-lg border-t border-slate-200/80">
          <div className="relative max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about law, legal procedures, or get help with legal documents..."
              className="w-full min-h-[50px] px-5 pr-24 py-3 border-2 border-slate-200 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none bg-white shadow-sm"
              disabled={isLoading}
              rows={1}
            />
            
            {/* Voice Button */}
            <button
              onClick={toggleVoiceRecording}
              disabled={isLoading}
              className={`absolute right-14 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 hover:scale-110 shadow-lg hover:shadow-emerald-500/25'
              } text-white disabled:opacity-50`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-500 hover:to-blue-600 hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center shadow-lg hover:shadow-blue-500/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={toggleVoiceResponse}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm transition-all ${
                voiceResponseEnabled
                  ? 'bg-blue-100 border border-blue-200 text-blue-700 hover:bg-blue-150'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-150'
              }`}
            >
              {voiceResponseEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Voice Responses {voiceResponseEnabled ? 'ON' : 'OFF'}
            </button>
            
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700 text-sm animate-fadeIn">
                🎤 Listening...
              </div>
            )}
          </div>
          
          <p className="text-xs text-slate-500 mt-2 text-center">
            ⚠️ This AI provides general legal information only. Always consult a qualified lawyer for specific legal advice.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AiChatbot