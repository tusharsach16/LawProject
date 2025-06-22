import { Bell, Menu } from "lucide-react";

const Header = ({ toggleSidebar, user }: 
  { 
    toggleSidebar: () => void,
    user: {name: string, role: string};
   }) => {
  const name = user?.name || "Guest";
  const role = user?.role || "Unknown";

  return (
    <header className="w-full px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
      {/* Left: Menu button for mobile */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar}>
          <Menu />
        </button>
        <h2 className="text-xl font-bold text-gray-800">LegalAssist Pro</h2>
      </div>

      {/* Right: Notification & Profile */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex flex-col items-end text-sm">
          <span className="font-medium text-gray-800">{name}</span>
          <span className="text-gray-500 text-xs">{role}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
