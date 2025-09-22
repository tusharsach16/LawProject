import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
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
  LogOut,
  Search, 
  Bell    
} from "lucide-react";
import { useAppSelector } from '../../redux/hooks'; 

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearchClick: () => void; // for searchbar
  onNotificationsClick: () => void; // for notification
};

const Sidebar = ({ isOpen, onClose, onSearchClick, onNotificationsClick}: SidebarProps) => {
  const navigate = useNavigate();
  //  Redux store se user ka data role nikala
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    navigate('/'); 
  };

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
            <SidebarLink icon={<Home size={18} />} label="Overview" to="/dashboard1" />
            
            <button
              onClick={() => {
                onSearchClick(); 
                onClose();      // Mobile par sidebar band kar dein
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-gray-100 text-gray-700"
            >
              <span className="text-gray-600"><Search size={18} /></span>
              <span>Search</span>
            </button>
            <button
              onClick={() => {
                onNotificationsClick(); // Notification kholne wala function call karein
                onClose(); 
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-gray-100 text-gray-700"
            >
              <span className="text-gray-600"><Bell size={18} /></span>
              <span>Notifications</span>
            </button>

            <SidebarLink icon={<MessageCircle size={18} />} label="AI Legal Chatbot" to="/dashboard1/chatbot" />
            <SidebarLink icon={<Book size={18} />} label="Law Info Hub" to="/dashboard1/law-info" />
            <SidebarLink icon={<Users size={18} />} label="Connect with Lawyers" to="/dashboard1/talk-to-lawyer" />
            <SidebarLink icon={<Briefcase size={18} />} label="Case Practice" to="/dashboard1/case-practice" />
            <SidebarLink icon={<HelpCircle size={18} />} label="Quiz Section" to="/dashboard1/quiz" />
            {user && (user.role === 'lawstudent' || user.role === 'lawyer') && (
              <SidebarLink icon={<Gavel size={18} />} label="Mock Trials" to="/dashboard1/mock-trials" />
            )}
            
            <div className="mt-6 border-t pt-4 space-y-1">
              <SidebarLink icon={<User size={18} />} label="Profile" to="/dashboard1/profile" />
              <SidebarLink icon={<Settings size={18} />} label="Settings" to="/dashboard1/settings" />
            </div>
          </div>
          <div className="border-t pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

type SidebarLinkProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  extraClasses?: string;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, to, extraClasses = "" }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition ${extraClasses} ${
        isActive 
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : 'hover:bg-gray-100'
      }`}
    >
      <span className={isActive ? 'text-blue-700' : 'text-gray-600'}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;

