import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the WebSocket URL for the application.
 * - Uses VITE_WS_URL if explicitly set
 * - Otherwise derives from VITE_API_URL
 * - Falls back to current window location for development
 * - Automatically converts http -> ws and https -> wss
 */
export function getWebSocketUrl(): string {
  // If explicitly set, use it
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  // Try to derive from API URL
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch (e) {
      console.warn('Failed to parse VITE_API_URL:', e);
    }
  }

  // Fallback: derive from current window location (for development)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the same host but default to port 5000 for development
    const host = window.location.hostname === 'localhost' 
      ? `${window.location.hostname}:5000`
      : window.location.host;
    return `${protocol}//${host}`;
  }

  // Last resort: default to localhost for development
  return 'ws://localhost:5000';
}
