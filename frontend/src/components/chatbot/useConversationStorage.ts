import { useState, useEffect } from 'react';
import type { Conversation, Message } from './types';

export const useConversationStorage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI Legal Assistant. How can I assist you with Indian law today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

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

  return {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages
  };
};