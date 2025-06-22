import React, { useState } from "react";

type Message = {
  type: "user" | "bot";
  text: string;
};

const VoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { type: "user", text: input };
    const botReply: Message = { type: "bot", text: generateReply(input) };

    setMessages((prev) => [...prev, userMessage, botReply]);
    setInput("");
  };

  const generateReply = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("fir")) {
      return "To file an FIR, visit the nearest police station and request the SHO.";
    }
    if (lower.includes("legal aid")) {
      return "You can connect to legal aid by calling 15100 (Legal Aid Helpline in India).";
    }
    return "Sorry, I didn't understand. Please ask a legal question.";
  };

  return (
    <div className="bg-blue-100 py-10 px-4 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Legal Chat Assistant</h2>
          <p className="text-gray-600 text-sm mt-1">
            Ask a legal question in your language and get an instant response.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto border rounded bg-gray-50 p-3 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input Field + Button */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your legal question..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
