import React from 'react';
import { Scale, Plus, History } from 'lucide-react';

interface ChatHeaderProps {
  onNewConversation: () => void;
  onOpenHistory: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewConversation, onOpenHistory }) => {
  return (
    <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-slate-700 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl">
          <Scale className="h-6 w-6 text-white" />
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
          onClick={onNewConversation} 
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 hover:border-amber-500/50 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
        <button 
          onClick={onOpenHistory} 
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 flex items-center gap-2"
        >
          <History size={16} />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;