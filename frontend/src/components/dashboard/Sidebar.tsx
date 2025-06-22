  import { Home, MessageCircle, Book, Users, Briefcase, HelpCircle, Gavel, User, Settings, LogOut } from 'lucide-react';

  const Sidebar = () => {
    return (
      <aside className="mt-18 w-64 min-h-screen bg-white border-r border-gray-200 ">

        <nav className="p-4 space-y-1 text-sm font-medium text-gray-700">
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
            <SidebarLink icon={<LogOut size={18} />} label="Logout" />
          </div>
        </nav>
      </aside>
    );
  };

  type SidebarLinkProps = {
    icon: React.ReactNode;
    label: string;
  };

  const SidebarLink = ({ icon, label }: SidebarLinkProps) => (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition">
      {icon}
      {label}
    </button>
  );

  export default Sidebar;
