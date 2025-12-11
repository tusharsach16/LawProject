import React, { useState, useRef, useEffect } from 'react';
import { askAiAssistant } from '../services/authService';
import type { Message, Conversation } from '../components/chatbot/types';
import ChatHeader from '../components/chatbot/ChatHeader';
import HistoryList from '../components/chatbot/HistoryList';
import WelcomeScreen from '../components/chatbot/WelcomeScreen';
import ChatMessages from '../components/chatbot/ChatMessages';
import ChatInput from '../components/chatbot/ChatInput';
import { useSpeechRecognition } from '../components/chatbot/useSpeechRecognition';
import { useSpeechSynthesis } from '../components/chatbot/useSpeechSynthesis';
import { useConversationStorage } from '../components/chatbot/useConversationStorage';
import { deriveTitleFromFirstUserMessage } from '../components/chatbot/utils';

const AiChatbot: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceResponseEnabled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showHistoryList, setShowHistoryList] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages
  } = useConversationStorage();

  const { speakText, stopSpeaking, currentSpeechRef } = useSpeechSynthesis(voiceResponseEnabled);
  
  const handleTranscript = (text: string) => {
    setInput(text);
  };
  
  const { isRecording, toggleRecording, recognitionRef, lastTranscriptRef } = useSpeechRecognition(handleTranscript);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('ai_conversations');
    const savedActive = localStorage.getItem('ai_active_conversation');
    if (saved && savedActive) {
      const active: Conversation | undefined = JSON.parse(saved).find((c: Conversation) => c.id === savedActive);
      if (active) {
        setShowWelcome(active.messages.length === 0);
      }
    }
  }, []);

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

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (currentSpeechRef.current) {
        stopSpeaking();
      }
      toggleRecording();
    }
  };

  useEffect(() => {
    if (!isRecording && lastTranscriptRef.current.trim()) {
      handleSendMessage(lastTranscriptRef.current.trim());
    }
  }, [isRecording]);

  const handleSendMessage = async (predefinedQuery?: string) => {
    const currentInput = predefinedQuery || input;
    if (!currentInput.trim()) return;

    console.log('Sending message:', currentInput);

    // Ensure we have an active conversation
    let currentConvId = activeConversationId;
    if (!currentConvId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: 'Conversation',
        updatedAt: Date.now(),
        messages: []
      };
      setConversations(prev => {
        const next = [newConv, ...prev];
        localStorage.setItem('ai_conversations', JSON.stringify(next));
        return next;
      });
      setActiveConversationId(newConv.id);
      setMessages([]);
      currentConvId = newConv.id;
      setShowWelcome(false);
    }

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
      
      console.log('Response from API:', response);

      // Check if response exists
      if (!response) {
        throw new Error('No response received from server');
      }

      // Check if the response contains an error
      if (response.error) {
        throw new Error(response.error || response.details || response.message || 'Unknown error from server');
      }

      // Check if response has reply property
      if (!response.reply) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server - missing reply field');
      }

      const botResponseText = response.reply;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'legal-advice'
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation with both messages
      setConversations(prev => {
        const next = prev.map(c => {
          if (c.id !== currentConvId) return c;
          const updated = { ...c, messages: [...c.messages, userMessage, botMessage], updatedAt: Date.now() };
          const title = c.title === 'Conversation' ? deriveTitleFromFirstUserMessage(updated) : c.title;
          return { ...updated, title };
        });
        localStorage.setItem('ai_conversations', JSON.stringify(next));
        return next;
      });
      
      speakText(botMessage.content);

    } catch (error: any) {
      console.error("Error in handleSendMessage:", error);
      
      // Extract error message from different error formats
      let errorMsg = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      if (error?.response?.data) {
        // Axios error response
        const data = error.response.data;
        errorMsg = data.error || data.details || data.message || errorMsg;
        
        // Add status code info
        if (error.response.status === 401) {
          errorMsg = "🔒 Authentication error. Please log in again.";
        } else if (error.response.status === 429) {
          errorMsg = "⏱️ Too many requests. Please wait a moment and try again.";
        } else if (error.response.status === 500) {
          errorMsg = "⚠️ Server error: " + errorMsg;
        }
      } else if (error?.message) {
        // Standard error
        if (error.message.includes('Network Error')) {
          errorMsg = "🌐 Network error. Please check your internet connection.";
        } else if (error.message.includes('timeout')) {
          errorMsg = "⏱️ Request timeout. The server took too long to respond.";
        } else {
          errorMsg = error.message;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${errorMsg}`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Also update conversation with error message
      setConversations(prev => {
        const next = prev.map(c => {
          if (c.id !== currentConvId) return c;
          return { ...c, messages: [...c.messages, userMessage, errorMessage], updatedAt: Date.now() };
        });
        localStorage.setItem('ai_conversations', JSON.stringify(next));
        return next;
      });
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <ChatHeader 
        onNewConversation={createNewConversation}
        onOpenHistory={openHistoryList}
      />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {showHistoryList && (
          <HistoryList 
            conversations={conversations}
            onClose={closeHistoryList}
            onLoadConversation={loadHistoryConversation}
          />
        )}

        {!showHistoryList && showWelcome && (
          <WelcomeScreen onQuickAction={handleQuickAction} />
        )}

        {!showHistoryList && !showWelcome && (
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      <ChatInput 
        input={input}
        isLoading={isLoading}
        isRecording={isRecording}
        onInputChange={setInput}
        onSend={() => handleSendMessage()}
        onToggleRecording={toggleVoiceRecording}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default AiChatbot;