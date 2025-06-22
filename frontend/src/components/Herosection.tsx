
const Herosection = () => {
  return (
    <div className="bg-blue-50 min-h-screen flex flex-col md:flex-row items-start justify-center gap-36 px-6 py-12">
      {/* Left Section */}
      <div className="flex flex-col gap-6 max-w-xl">
        <div className="inline-flex items-center rounded-full bg-white px-4 py-1 text-sm shadow-sm">
          <span className="mr-2 h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-gray-800 font-medium">Accessible Legal Support</span>
        </div>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
          Legal Guidance in <span className="text-blue-600">Your Voice</span>, Your Language
        </h1>

        <p className="text-lg text-gray-700 max-w-md">
          Access personalized legal assistance through voice messages and SMS in multiple languages, designed for everyone regardless of literacy level.
        </p>

        <div className="flex gap-3 mt-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded shadow hover:bg-blue-800 transition">
            {/* <Mic size={18} /> */}
            Try Voice Assistant
          </button>
          <button className="flex items-center gap-2 border border-gray-300 bg-white px-5 py-2.5 rounded shadow hover:bg-gray-100 transition">
            <span>→</span>
            Learn More
          </button>
        </div>

        <div className="text-sm text-gray-600 mt-6 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
          Join 10,000+ users getting legal help
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col bg-white px-6 py-5 rounded-xl shadow-lg w-full md:w-[420px]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
              {/* <Mic size={16} className="text-blue-600" /> */}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Legal Guardian</h3>
              <p className="text-xs text-gray-500">Voice Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-100 rounded-full">
              {/* <Mic size={16} /> */}
            </button>
            <button className="p-2 bg-gray-100 rounded-full">
              {/* <Volume2 size={16} /> */}
            </button>
          </div>
        </div>

        <div className="bg-gray-100 px-4 py-3 rounded-md text-sm text-gray-800 mb-2">
          How do I file a police complaint in Kerala?
        </div>

        <div className="bg-blue-100 px-4 py-3 rounded-md text-sm text-gray-900 space-y-2">
          <p>Here are 5 steps to file a police complaint in Kerala:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Visit the nearest police station in your jurisdiction</li>
            <li>Ask for the Station House Officer (SHO)</li>
            <li>Provide your verbal complaint</li>
            <li>Get your statement recorded (FIR)</li>
            <li>Collect your FIR copy (it's your right)</li>
          </ol>
          <p className="font-medium text-blue-600">
            Need more help? Say "Connect me to legal aid"
          </p>
        </div>

        <div className="flex mt-3 gap-2">
          <input
            type="text"
            placeholder="Ask a legal question..."
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-800 transition text-sm">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Herosection;
