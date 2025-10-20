export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'legal-advice';
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

export interface VoiceRecognition extends EventTarget {
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