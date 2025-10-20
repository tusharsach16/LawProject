import { useRef, useState } from 'react';
import type { VoiceRecognition } from './types';

export const useSpeechRecognition = (onTranscript: (text: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const lastTranscriptRef = useRef<string>('');

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      recognitionRef.current = new (window as any).SpeechRecognition();
    } else {
      return false;
    }

    const recognition = recognitionRef.current;
    if (!recognition) return false;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      lastTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      lastTranscriptRef.current = transcript;
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      const finalTranscript = lastTranscriptRef.current.trim();
      if (finalTranscript) {
        // Handle final transcript in parent component
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    return true;
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
      }
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return { isRecording, toggleRecording, recognitionRef, lastTranscriptRef };
};