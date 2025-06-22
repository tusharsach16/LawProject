// components/WhatsAppButton.tsx
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const phoneNumber = "919876543210"; // Change this to your number
  const message = "Hi, I need legal assistance."; // Pre-filled message

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex flex-col items-center shadow-sm">
      <h2 className="text-lg font-semibold text-green-800">Chat on WhatsApp</h2>
      <p className="text-sm text-green-700 mt-1 text-center">
        Connect with us directly on WhatsApp for quick legal help.
      </p>
      <button
        onClick={handleClick}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
      >
        <FaWhatsapp className="w-5 h-5" />
        Start WhatsApp Chat
      </button>
    </div>
  );
};

export default WhatsAppButton;
