import type { Conversation } from './types';

export const deriveTitleFromFirstUserMessage = (conv: Conversation): string => {
  const firstUser = conv.messages.find(m => m.sender === 'user');
  const text = firstUser?.content || '';
  const clean = text.replace(/<[^>]*>/g, ' ').trim();
  return clean ? (clean.length > 40 ? clean.slice(0, 40) + '…' : clean) : 'Conversation';
};