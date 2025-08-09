import {
  Home,
  MessageCircle,
  Book,
  Users,
  Briefcase,
  HelpCircle,
  Gavel,
  User,
  Settings,
  LogOut
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Backdrop for mobile/tablet */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg flex flex-col transition-transform duration-200 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static`}
      >
        {/* Menu items */}
        <nav className="flex flex-col h-full p-4 text-sm font-medium text-gray-700">
          <div className="space-y-2 flex-1">
            <SidebarLink icon={<Home size={18} />} label="Overview" />
            <SidebarLink icon={<MessageCircle size={18} />} label="AI Legal Chatbot" />
            <SidebarLink icon={<Book size={18} />} label="Law Info Hub" />
            <SidebarLink icon={<Users size={18} />} label="Connect with Lawyers" />
            <SidebarLink icon={<Briefcase size={18} />} label="Case Practice" />
            <SidebarLink icon={<HelpCircle size={18} />} label="Quiz Section" />
            <SidebarLink icon={<Gavel size={18} />} label="Mock Trials" />

            <div className="mt-6 border-t pt-4 space-y-1">
              <SidebarLink icon={<User size={18} />} label="Profile" />
              <SidebarLink icon={<Settings size={18} />} label="Settings" />
            </div>
          </div>

          {/* Logout Button at bottom */}
          <div className="border-t pt-4">
            <SidebarLink
              icon={<LogOut size={18} />}
              label="Logout"
              extraClasses="bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
            />
          </div>
        </nav>
      </aside>
    </>
  );
};

type SidebarLinkProps = {
  icon: React.ReactNode;
  label: string;
  extraClasses?: string;
};

const SidebarLink = ({ icon, label, extraClasses = "" }: SidebarLinkProps) => (
  <button
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition ${extraClasses}`}
  >
    <span className="text-gray-600">{icon}</span>
    <span>{label}</span>
  </button>
);

export default Sidebar;
