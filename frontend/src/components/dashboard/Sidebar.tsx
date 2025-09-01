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
  onNavigate: (page: string) => void;
};

const Sidebar = ({ isOpen, onClose, onNavigate }: SidebarProps) => {
  return (
    <>
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
        <nav className="flex flex-col h-full p-4 text-sm font-medium text-gray-700">
          <div className="space-y-2 flex-1">
            <SidebarLink icon={<Home size={18} />} label="Overview" onClick={() => onNavigate('overview')} />
            <SidebarLink icon={<MessageCircle size={18} />} label="AI Legal Chatbot" onClick={() => onNavigate('chatbot')} />
            <SidebarLink icon={<Book size={18} />} label="Law Info Hub" onClick={() => onNavigate('law-info')} />
            <SidebarLink icon={<Users size={18} />} label="Connect with Lawyers" onClick={() => onNavigate('connect')} />
            <SidebarLink icon={<Briefcase size={18} />} label="Case Practice" onClick={() => onNavigate('case-practice')} />
            <SidebarLink icon={<HelpCircle size={18} />} label="Quiz Section" onClick={() => onNavigate('quiz')} />
            <SidebarLink icon={<Gavel size={18} />} label="Mock Trials" onClick={() => onNavigate('mock-trials')} />

            <div className="mt-6 border-t pt-4 space-y-1">
              <SidebarLink icon={<User size={18} />} label="Profile" onClick={() => onNavigate('profile')} />
              <SidebarLink icon={<Settings size={18} />} label="Settings" onClick={() => onNavigate('settings')} />
            </div>
          </div>

          <div className="border-t pt-4">
            <SidebarLink
              icon={<LogOut size={18} />}
              label="Logout"
              extraClasses="bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
              onClick={() => { /* Logout logic */ }}
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
  onClick: () => void;
};

const SidebarLink = ({ icon, label, extraClasses = "", onClick }: SidebarLinkProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition ${extraClasses}`}
  >
    <span className="text-gray-600">{icon}</span>
    <span>{label}</span>
  </button>
);

export default Sidebar;