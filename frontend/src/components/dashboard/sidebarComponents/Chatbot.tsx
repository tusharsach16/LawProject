// components/Chatbot.tsx
import { MessageSquare, Mic } from "lucide-react";
import WhatsApp from "./WhatsappButton";          // 👈 नया import

const Chatbot = () => {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 w-full flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center">
          <MessageSquare className="h-6 w-6 text-black mt-2" />
          <h2 className="ml-1 text-xl font-semibold text-gray-800">
            AI‑Powered Legal Chatbot
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Get instant legal guidance in any Indian language
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto mt-6 space-y-6">
        {/* Input mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Text input */}
          <div className="flex flex-col justify-between bg-gray-50 border rounded-xl p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h3 className="font-bold text-gray-800">Text Input</h3>
            </div>
            <button
              aria-label="Start text chat"
              className="mt-4 self-start px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Start Text Chat
            </button>
          </div>

          {/* Voice input */}
          <div className="flex flex-col justify-between bg-gray-50 border rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Mic className="h-6 w-6 text-blue-600" />
              <h3 className="font-bold text-gray-800">Voice Input</h3>
            </div>
            <button
              aria-label="Start voice chat"
              className="mt-4 self-start px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Start Voice Chat
            </button>
          </div>
        </div>

        {/* 🟢 WhatsApp Button */}
        <div className="grid ">
          <WhatsApp />
        </div>

        {/* Feature list */}
        <div className="bg-blue-100 rounded-xl p-4">
          <h4 className="font-bold text-gray-800">
            What the AI can help with:
          </h4>
          <ul className="list-disc ml-6 mt-2 text-sm text-gray-700 space-y-1">
            <li>Determine which legal section your case falls under</li>
            <li>Analyze if the case is in your favor</li>
            <li>Provide step‑by‑step legal guidance</li>
            <li>Reference past similar cases</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
