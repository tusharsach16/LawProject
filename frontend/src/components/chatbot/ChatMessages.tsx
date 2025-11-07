import React from 'react';
import { Scale, User, Loader } from 'lucide-react';
import type { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, messagesEndRef }) => {
  return (
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
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
          <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Scale size={20} className="text-white" />
          </div>
          <div className="bg-white border-2 border-slate-200 p-5 rounded-2xl rounded-bl-md shadow-sm">
            <Loader className="w-5 h-5 animate-spin text-amber-600" />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;