import { Book, Search } from "lucide-react";

const info = [
  {
    title: "Know Your Rights",
    icon: <Search className="text-blue-600 w-5 h-5" />,
    desc: "Search Laws",
  },
  {
    title: "Crime or Not?",
    icon: <Search className="text-blue-600 w-5 h-5" />,
    desc: "Check Cases",
  },
  {
    title: "Case Studies",
    icon: <Search className="text-blue-600 w-5 h-5" />,
    desc: "Browse Repository",
  },
];

const LawInfo = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Book className="h-6 w-6 text-black" />
        <h2 className="font-bold text-2xl text-black">Law Information Hub</h2>
      </div>
      <p className="text-sm text-gray-700 mb-6">
        Comprehensive legal knowledge at your fingertips
      </p>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {info.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-4 flex flex-col items-start shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
            </div>
            <button className="bg-blue-300 px-2 py-1 rounded-xl cursor-pointer hover:bg-blue-600">{item.desc}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawInfo;
