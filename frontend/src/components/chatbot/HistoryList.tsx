import React from 'react';
import { History, X, MessageSquare } from 'lucide-react';
import type { Conversation } from './types';

interface HistoryListProps {
  conversations: Conversation[];
  onClose: () => void;
  onLoadConversation: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ conversations, onClose, onLoadConversation }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <History className="h-6 w-6 text-amber-500" />
          Your Conversations
        </h2>
        <button 
          onClick={onClose} 
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
              onClick={() => onLoadConversation(item.id)} 
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
  );
};

export default HistoryList;