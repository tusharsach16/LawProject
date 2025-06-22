import {
  Briefcase,
  GraduationCap,
  Gavel,
  Star,
} from "lucide-react";

const stats = [
  {
    title: "Case Analysed",
    number: "23",
    icon: <Briefcase className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Quiz Average Score",
    number: "87%",
    icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Mock Trials",
    number: "8",
    icon: <Gavel className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Rating",
    number: "4.8",
    icon: <Star className="h-6 w-6 text-blue-600" />,
  },
];

const stats2 = [
  {
    title: "Ask AI Legal Assistant",
    desc: "Get instant legal guidance in any Indian Language",
    button: "Start Conversation"
  },
  {
    title: "Practice Real Cases",
    desc: "Analyze anonymised legal cases and get AI feedback",
    button: "View Cases"
  },
  {
    title: "Join Mock Trial",
    desc: "Participate in debates and improve your skills",
    button: "Find Debates"
  }
]

const activity = [
  {
    title: "Property Dispute Analysis",
    time: "2 hours ago",
    button: "Completed"
  },
  {
    title: "Constitutional Law Quiz",
    time: "1 hour ago",
    button: "Scored 85%"
  },
  {
    title: "Consultation with Adv. Kumar",
    time: "3 hours ago",
    button: "Scheduled"
  },
  {
    title: "Mock Trial: Contract Breach",
    time: "4 hours ago",
    button: "Won"
  },
]

const Main = ({user}: {user: {name: string}}) => {
  const name = user?.name || "Guest";
  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full bg-gray-100">
      {/* Welcome Banner */}
      <div className="flex flex-col bg-blue-500 text-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl sm:text-3xl font-semibold">Welcome back, {name}</h2>
        <p className="mt-2 text-sm sm:text-base">Continue your legal journey with AI-powered assistance and expert guidance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-2xl font-bold text-blue-600">{item.number}</p>
            </div>
            <div>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {stats2.map((items, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{items.title}</h2>
              <p className="text-sm text-gray-600 mt-2">{items.desc}</p>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition w-fit">
              {items.button}
            </button>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white mt-6 rounded-2xl border p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="font-bold text-2xl text-gray-800">Recent Activity</h1>
          <p className="text-gray-500 text-sm mt-1">Your latest interactions on the platform</p>
        </div>

        <div className="space-y-4">
          {activity.map((items, i) => (
            <div
              key={i}
              className="bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border transition hover:shadow-md gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                <div>
                  <h3 className="font-medium text-gray-800 text-base">{items.title}</h3>
                  <p className="text-gray-500 text-sm">{items.time}</p>
                </div>
              </div>
              <span className="bg-white border border-gray-300 px-4 py-1.5 text-sm rounded-full text-gray-700 whitespace-nowrap">
                {items.button}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Main;
