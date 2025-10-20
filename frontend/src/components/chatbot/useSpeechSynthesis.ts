import { useRef } from 'react';

export const useSpeechSynthesis = (voiceResponseEnabled: boolean) => {
  const currentSpeechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = (text: string) => {
    if (!voiceResponseEnabled || !text) return;
    speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/⚠️.*$/g, '').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentSpeechRef.current = utterance;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    const voices = speechSynthesis.getVoices();
    const preferred = voices.filter(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Microsoft')));
    if (preferred.length > 0) utterance.voice = preferred[0];
    utterance.onend = () => { currentSpeechRef.current = null; };
    utterance.onerror = () => { currentSpeechRef.current = null; };
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    currentSpeechRef.current = null;
  };

  return { speakText, stopSpeaking, currentSpeechRef };
};