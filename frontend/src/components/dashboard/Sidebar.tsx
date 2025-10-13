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
  Bell,
  History,
  ChevronLeft,
  ChevronRight,
  Scale
} from "lucide-react";
import { useAppSelector } from '../../redux/hooks'; 

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

const Sidebar = ({ 
  isOpen, 
  onClose, 
  onSearchClick, 
  onNotificationsClick,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    navigate('/'); 
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r-2 border-amber-500/20 shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64`}
      >
        {/* Header with Logo */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl shadow-lg">
              <Scale className="h-6 w-6 text-slate-900" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-amber-400 font-bold text-lg tracking-tight">Law Connect</span>
              <span className="text-slate-400 text-xs">Legal Dashboard</span>
            </div>
          </div>
          
          {/* Collapse Toggle Button - Desktop Only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-amber-500/50 transition-all duration-300 group"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-amber-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-full p-4 text-sm font-medium overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5 flex-1">
            {/* Main Navigation */}
            <SidebarLink 
              icon={<Home size={20} />} 
              label="Overview" 
              to="/dashboard"
              isCollapsed={isCollapsed}
            />
            
            <button
              onClick={() => {
                onSearchClick(); 
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-800 text-slate-300 hover:text-amber-400 group ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
              title={isCollapsed ? "Search" : ""}
            >
              <span className="text-slate-400 group-hover:text-amber-400 transition-colors">
                <Search size={20} />
              </span>
              <span className={`transition-opacity duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Search
              </span>
            </button>

            <button
              onClick={() => {
                onNotificationsClick();
                onClose(); 
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-800 text-slate-300 hover:text-amber-400 group relative ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
              title={isCollapsed ? "Notifications" : ""}
            >
              <span className="text-slate-400 group-hover:text-amber-400 transition-colors">
                <Bell size={20} />
              </span>
              <span className={`transition-opacity duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Notifications
              </span>
              {/* Notification badge */}
              <span className="absolute top-1 right-1 lg:top-2 lg:right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <SidebarLink 
              icon={<MessageCircle size={20} />} 
              label="AI Legal Chatbot" 
              to="/dashboard/chatbot"
              isCollapsed={isCollapsed}
            />

            <SidebarLink 
              icon={<Book size={20} />} 
              label="Law Info Hub" 
              to="/dashboard/law-info"
              isCollapsed={isCollapsed}
            />

            <SidebarLink 
              icon={<Users size={20} />} 
              label="Connect with Lawyers" 
              to="/dashboard/talk-to-lawyer"
              isCollapsed={isCollapsed}
            />

            <SidebarLink 
              icon={<Briefcase size={20} />} 
              label="Case Practice" 
              to="/dashboard/case-practice"
              isCollapsed={isCollapsed}
            />

            <SidebarLink 
              icon={<HelpCircle size={20} />} 
              label="Quiz Section" 
              to="/dashboard/quiz"
              isCollapsed={isCollapsed}
            />

            {/* Conditional Links for Law Students and Lawyers */}
            {user && (user.role === 'lawstudent' || user.role === 'lawyer') && (
              <>
                <div className={`my-3 border-t border-slate-700/50 pt-3 ${isCollapsed ? 'lg:mx-2' : ''}`}>
                  <div className={`text-xs text-slate-500 uppercase tracking-wider mb-2 px-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
                    Professional
                  </div>
                </div>
                <SidebarLink 
                  icon={<Gavel size={20} />} 
                  label="Mock Trials" 
                  to="/dashboard/mock-trials"
                  isCollapsed={isCollapsed}
                />
                <SidebarLink 
                  icon={<History size={20} />} 
                  label="Past Trials" 
                  to="/dashboard/past-trials"
                  isCollapsed={isCollapsed}
                />
              </>
            )}
            
            {/* Settings Section */}
            <div className={`mt-6 border-t border-slate-700/50 pt-3 space-y-1.5 ${isCollapsed ? 'lg:mx-2' : ''}`}>
              <div className={`text-xs text-slate-500 uppercase tracking-wider mb-2 px-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Account
              </div>
              <SidebarLink 
                icon={<User size={20} />} 
                label="Profile" 
                to="/dashboard/profile"
                isCollapsed={isCollapsed}
              />
              <SidebarLink 
                icon={<Settings size={20} />} 
                label="Settings" 
                to="/dashboard/settings"
                isCollapsed={isCollapsed}
              />
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t border-slate-700/50 pt-4 mt-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 group ${
                isCollapsed ? 'lg:justify-center' : ''
              }`}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut size={20} className="group-hover:rotate-6 transition-transform" />
              <span className={`font-semibold transition-opacity duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Logout
              </span>
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
  isCollapsed: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  icon, 
  label, 
  to, 
  extraClasses = "",
  isCollapsed 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${extraClasses} ${
        isActive 
          ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/30'
          : 'hover:bg-slate-800 text-slate-300 hover:text-amber-400'
      } ${isCollapsed ? 'lg:justify-center' : ''}`}
      title={isCollapsed ? label : ""}
    >
      {/* Active Indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-r-full"></span>
      )}
      
      <span className={`${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'} transition-colors flex-shrink-0`}>
        {icon}
      </span>
      <span className={`font-medium transition-opacity duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
        {label}
      </span>
      
      {/* Hover effect glow */}
      {!isActive && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/10 transition-all duration-300 -z-10"></span>
      )}
    </Link>
  );
};

export default Sidebar;