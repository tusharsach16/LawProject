import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  Users,
  HelpCircle,
  Gavel,
  User,
  LogOut,
  Search,
  Bell,
  History,
  ChevronLeft,
  Scale,
  BarChart3,
  Calendar
} from "lucide-react";
import { useAppSelector } from '../../redux/hooks';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLawyer?: boolean;
  notificationCount?: number;
};

const Sidebar = ({
  isOpen,
  onClose,
  onSearchClick,
  onNotificationsClick,
  isCollapsed,
  onToggleCollapse,
  isLawyer = false,
  notificationCount = 0,
}: SidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    navigate('/');
  };

  // Determine base route based on user role
  const baseRoute = isLawyer ? '/lawyer-dashboard' : '/dashboard';

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
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
          {/* Desktop: Show based on isCollapsed */}
          <div className="hidden lg:flex items-center gap-3 flex-1 min-w-0">
            {!isCollapsed ? (
              <>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-2 rounded-xl shadow-lg flex-shrink-0">
                  <Scale className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-amber-400 font-bold text-lg tracking-tight truncate">
                    {isLawyer ? 'Lawyer Portal' : 'Nyay Setu'}
                  </span>
                  <span className="text-slate-400 text-xs">Legal Dashboard</span>
                </div>
              </>
            ) : (
              /* When collapsed: clicking the logo expands the sidebar */
              <button
                onClick={onToggleCollapse}
                className="flex items-center justify-center w-full group"
                title="Expand sidebar"
              >
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-2 rounded-xl shadow-lg group-hover:ring-2 group-hover:ring-amber-500/50 transition-all">
                  <Scale className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </button>
            )}
          </div>

          {/* Mobile: Always show full logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-2 rounded-xl shadow-lg">
              <Scale className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-amber-400 font-bold text-lg tracking-tight">
                {isLawyer ? 'Lawyer Portal' : 'Nyay Setu'}
              </span>
              <span className="text-slate-400 text-xs">Legal Dashboard</span>
            </div>
          </div>

          {/* Collapse Toggle Arrow — only shown when expanded */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-amber-500/50 transition-all duration-300 group flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-amber-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-full p-4 text-sm font-medium overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5 flex-1">
            {/* Main Navigation */}
            <SidebarLink
              icon={<Home size={20} />}
              label="Overview"
              to={baseRoute}
              isCollapsed={isCollapsed}
            />

            <button
              onClick={() => {
                onSearchClick();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-800 text-slate-300 hover:text-amber-400 group ${isCollapsed ? 'lg:justify-center' : ''
                }`}
              title={isCollapsed ? "Search" : ""}
            >
              <span className="text-slate-400 group-hover:text-amber-400 transition-colors flex-shrink-0">
                <Search size={20} />
              </span>
              {!isCollapsed && (
                <span className="lg:block hidden">Search</span>
              )}
              <span className="lg:hidden">Search</span>
            </button>

            <button
              onClick={() => {
                onNotificationsClick();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-slate-800 text-slate-300 hover:text-amber-400 group relative ${isCollapsed ? 'lg:justify-center' : ''
                }`}
              title={isCollapsed ? "Notifications" : ""}
            >
              <span className="text-slate-400 group-hover:text-amber-400 transition-colors flex-shrink-0">
                <Bell size={20} />
              </span>
              {!isCollapsed && (
                <span className="lg:block hidden">Notifications</span>
              )}
              <span className="lg:hidden">Notifications</span>
              {/* Notification badge — only shows when there are unseen notifications */}
              {notificationCount > 0 && (
                <span className={`absolute ${isCollapsed ? 'top-1 right-1/4' : 'top-2 right-2'} w-2 h-2 bg-red-500 rounded-full animate-pulse`} />
              )}
            </button>

            {/* Lawyer-specific: Appointments */}
            {isLawyer && (
              <SidebarLink
                icon={<Calendar size={20} />}
                label="Appointments"
                to={`${baseRoute}/appointments`}
                isCollapsed={isCollapsed}
              />
            )}
            {isLawyer && (
              <SidebarLink
                icon={<Calendar size={20} />}
                label="Availability"
                to={`${baseRoute}/availability`}
                isCollapsed={isCollapsed}
              />)}

            <SidebarLink
              icon={<MessageCircle size={20} />}
              label="AI Legal Chatbot"
              to={`${baseRoute}/chatbot`}
              isCollapsed={isCollapsed}
            />

            {/* Non-lawyer only: Connect with Lawyers */}
            {!isLawyer && (
              <SidebarLink
                icon={<Users size={20} />}
                label="Connect with Lawyers"
                to={`${baseRoute}/talk-to-lawyer`}
                isCollapsed={isCollapsed}
              />
            )}

            <SidebarLink
              icon={<HelpCircle size={20} />}
              label="Quiz Section"
              to={`${baseRoute}/quiz`}
              isCollapsed={isCollapsed}
            />

            <SidebarLink
              icon={<BarChart3 size={20} />}
              label="Quiz History"
              to={`${baseRoute}/quiz-history`}
              isCollapsed={isCollapsed}
            />

            {/* Professional Section for Law Students and Lawyers */}
            {user && (user.role === 'lawstudent' || user.role === 'lawyer') && (
              <>
                <div className={`my-3 border-t border-slate-700/50 pt-3 ${isCollapsed ? 'mx-2' : ''}`}>
                  {!isCollapsed && (
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-3 lg:block hidden">
                      Professional
                    </div>
                  )}
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-3 lg:hidden">
                    Professional
                  </div>
                </div>
                <SidebarLink
                  icon={<Gavel size={20} />}
                  label="Mock Trials"
                  to={`${baseRoute}/mock-trials`}
                  isCollapsed={isCollapsed}
                />
                <SidebarLink
                  icon={<History size={20} />}
                  label="Past Trials"
                  to={`${baseRoute}/past-trials`}
                  isCollapsed={isCollapsed}
                />
              </>
            )}

            {/* Settings Section */}
            <div className={`mt-6 border-t border-slate-700/50 pt-3 space-y-1.5 ${isCollapsed ? 'mx-2' : ''}`}>
              {!isCollapsed && (
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-3 lg:block hidden">
                  Account
                </div>
              )}
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-3 lg:hidden">
                Account
              </div>
              <SidebarLink
                icon={<User size={20} />}
                label="Profile"
                to={`${baseRoute}/profile`}
                isCollapsed={isCollapsed}
              />
            </div>
          </div>

          {/* Logout Button */}
          <div className="border-t border-slate-700/50 pt-4 mt-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 group ${isCollapsed ? 'lg:justify-center' : ''
                }`}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut size={20} className="group-hover:rotate-6 transition-transform flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-semibold lg:block hidden">Logout</span>
              )}
              <span className="font-semibold lg:hidden">Logout</span>
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${extraClasses} ${isActive
        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/30'
        : 'hover:bg-slate-800 text-slate-300 hover:text-amber-400'
        } ${isCollapsed ? 'lg:justify-center' : ''}`}
      title={isCollapsed ? label : ""}
    >
      {/* Active Indicator */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-r-full"></span>
      )}

      <span className={`${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'} transition-colors flex-shrink-0`}>
        {icon}
      </span>
      {!isCollapsed && (
        <span className="font-medium lg:block hidden flex-1 truncate">{label}</span>
      )}
      <span className="font-medium lg:hidden flex-1 truncate">{label}</span>



      {/* Hover effect glow */}
      {!isActive && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/10 transition-all duration-all duration-300 -z-10"></span>
      )}
    </Link>
  );
};

export default Sidebar;