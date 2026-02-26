import React, { useRef, useEffect } from 'react';
import { Send, Mic, Shield, Globe } from 'lucide-react';

const LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Marathi', value: 'Marathi' },
  { label: 'Tamil', value: 'Tamil' },
  { label: 'Telugu', value: 'Telugu' },
  { label: 'Punjabi', value: 'Punjabi' },
];

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  isRecording: boolean;
  selectedLanguage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onToggleRecording: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onLanguageChange: (lang: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  isLoading,
  isRecording,
  selectedLanguage,
  onInputChange,
  onSend,
  onToggleRecording,
  onKeyDown,
  onLanguageChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  return (
    <div className="px-6 py-5 bg-white border-t-2 border-slate-200">
      {/* Language selector row */}
      <div className="max-w-4xl mx-auto mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="text-xs text-slate-500 font-medium">Reply language:</span>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onLanguageChange(lang.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${selectedLanguage === lang.value
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400 hover:text-amber-600'
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div className="relative max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Ask anything about Indian law… Reply will be in ${selectedLanguage}`}
          className="w-full min-h-[56px] px-6 pr-28 py-4 border-2 border-slate-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none resize-none bg-white shadow-sm text-slate-900 placeholder-slate-400"
          disabled={isLoading}
          rows={1}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={onToggleRecording}
            disabled={isLoading}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed ${isRecording
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
  );
};

export default ChatInput;