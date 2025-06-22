
const features = [
  {
    title: "Multilingual Support",
    desc: "Get legal assistance in your preferred language with accurate translations of complex legal terms.",
    // icon: <Globe className="text-blue-600 h-6 w-6" />,
  },
  {
    title: "Voice-First Interface",
    desc: "Interact naturally through voice messages, making legal help accessible to everyone regardless of literacy.",
    // icon: <Headphones className="text-blue-600 h-6 w-6" />,
  },
  {
    title: "Localized Legal Guidance",
    desc: "Receive legal information specific to your region and state laws in simple, easy-to-understand terms.",
    // icon: <Shield className="text-blue-600 h-6 w-6" />,
  },
  {
    title: "Nearby Legal Aid",
    desc: "Find free lawyers and NGOs near your location with just your pincode via SMS or WhatsApp.",
    // icon: <MapPin className="text-blue-600 h-6 w-6" />,
  },
  {
    title: "Gamified Learning",
    desc: "Earn 'Legal Warrior' badges by completing voice-based quizzes that teach you about your rights.",
    // icon: <Trophy className="text-blue-600 h-6 w-6" />,
  },
  {
    title: "Interactive Scenarios",
    desc: "Learn through engaging audio stories based on real-life legal situations relevant to your community.",
    // icon: <MessageSquare className="text-blue-600 h-6 w-6" />,
  },
];

const Featuresection = () => {
  return (
    <section className="px-4 py-12 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900">Features</h2>
        <p className="text-gray-600 mt-4 text-lg">
          Our voice-first legal assistant makes legal literacy accessible to everyone, regardless of education level or technological familiarity.
        </p>
      </div>

      <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {features.map((f, i) => (
          <div key={i} className="bg-white border-blue-500 rounded-xl shadow-md p-6 hover:shadow-lg transition">
            {/* <div className="bg-blue-50 p-2 inline-block rounded mb-4">{f.icon}</div> */}
            <h3 className="font-semibold text-lg text-gray-900">{f.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Featuresection;
