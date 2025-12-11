import React from 'react';
import { Scale, User, Loader } from 'lucide-react';
import type { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const formatBotMessage = (text: string) => {
  // Split by disclaimer first to handle it separately
  const parts = text.split('⚠️');
  let mainContent = parts[0];
  const disclaimer = parts.length > 1 ? '⚠️' + parts.slice(1).join('⚠️') : '';

  // Format numbered lists with bold titles (e.g., "1. **Mediation:**")
  mainContent = mainContent.replace(/(\d+)\.\s+\*\*(.+?)\*\*\s*/g, (num, title) => {
    return `<div class="numbered-item"><span class="number">${num}</span><strong>${title}</strong></div>`;
  });

  // Format bullet points with bold text (nested items)
  mainContent = mainContent.replace(/\*\s+\*\*(.+?)\*\*\s*/g, '<div class="bullet-item"><span class="bullet">•</span><strong>$1</strong></div>');
  
  // Format remaining bold text
  mainContent = mainContent.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  
  // Format italic text
  mainContent = mainContent.replace(/\*(.+?)\*/g, '<em class="italic text-slate-700">$1</em>');
  
  // Format inline code
  mainContent = mainContent.replace(/`(.+?)`/g, '<code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-amber-700">$1</code>');
  
  // Handle paragraphs - double line breaks
  mainContent = mainContent.replace(/\n\n/g, '<div class="paragraph-break"></div>');
  
  // Handle single line breaks within content
  mainContent = mainContent.replace(/\n/g, '<br/>');

  // Format disclaimer if present
  let formattedDisclaimer = '';
  if (disclaimer) {
    formattedDisclaimer = `<div class="disclaimer-box">${disclaimer.replace(/\n/g, '<br/>')}</div>`;
  }

  return mainContent + formattedDisclaimer;
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, messagesEndRef }) => {
  return (
    <>
      <style>{`
        /* Numbered list items styling */
        .numbered-item {
          display: flex;
          gap: 12px;
          margin: 20px 0;
          align-items: flex-start;
        }
        
        .numbered-item .number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
        }
        
        .numbered-item strong {
          display: block;
          color: #0f172a;
          font-size: 16px;
          margin-bottom: 6px;
          font-weight: 600;
        }
        
        /* Bullet points styling */
        .bullet-item {
          display: flex;
          gap: 12px;
          margin: 12px 0 12px 32px;
          align-items: flex-start;
        }
        
        .bullet-item .bullet {
          color: #f59e0b;
          font-size: 20px;
          font-weight: bold;
          line-height: 1.5;
          flex-shrink: 0;
        }
        
        .bullet-item strong {
          display: inline;
          color: #1e293b;
          font-weight: 600;
        }
        
        /* Disclaimer styling */
        .disclaimer-box {
          margin-top: 24px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left: 4px solid #f59e0b;
          border-radius: 8px;
          font-size: 14px;
          color: #92400e;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }
        
        /* Paragraph spacing */
        .paragraph-break {
          height: 16px;
        }
        
        /* General message content styling */
        .message-content {
          line-height: 1.8;
          color: #334155;
          font-size: 15px;
        }
        
        .message-content strong {
          color: #0f172a;
        }
        
        .message-content em {
          color: #475569;
        }

        /* Animation */
        @keyframes slideInMessage {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
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
            
            <div className={`max-w-2xl p-6 rounded-2xl shadow-sm ${
              message.sender === 'user' 
                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-br-md' 
                : 'bg-white border-2 border-slate-200 text-slate-800 rounded-bl-md'
            }`}>
              {message.sender === 'bot' ? (
                <div 
                  className="message-content" 
                  dangerouslySetInnerHTML={{ __html: formatBotMessage(message.content) }}
                />
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              )}
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
    </>
  );
};

export default ChatMessages;