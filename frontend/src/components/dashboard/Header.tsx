import { Menu, Settings, LogOut, User, ChevronDown, Scale } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "../../redux/hooks";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/userSlice";
import { useAppDispatch } from "../../redux/hooks";
type HeaderProps = {
  onToggleSidebar: () => void;
};

function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAppSelector((s) => s.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-500/20 shadow-2xl">
      {/* Left: Toggle + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-xl hover:bg-slate-800 transition-all duration-300 lg:hidden group" 
        >
          <Menu size={20} className="text-slate-400 group-hover:text-amber-400" />
        </button>

        {/* Logo + Site name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-800  border-slate-700  rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-slate-900 font-bold text-lg">
            <Scale className="h-6 w-6 text-white" strokeWidth={2.5} />
            </span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold text-amber-400 tracking-tight">
              NyaySetu
            </span>
            <p className="text-xs text-slate-400 font-medium">Legal Assistant Platform</p>
          </div>
        </div>
      </div>

      {/* Center: Search Bar (hidden on mobile)
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases, laws, articles..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border-2 border-slate-700 rounded-xl text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-slate-900 transition-all"
          />
        </div>
      </div> */}

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Icon (mobile only) */}
        {/* <button className="md:hidden p-2 rounded-xl hover:bg-slate-800 transition-all duration-300">
          <Search size={18} className="text-slate-400" />
        </button> */}
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-3 bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 py-2 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-lg object-cover" />
              ): (<User size={16} className="text-slate-900" />) }
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-bold text-slate-200 leading-none">
                {user?.name ?? "Guest"}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-0.5">
                {user?.role ?? "Visitor"}
              </span>
            </div>
            <ChevronDown 
              size={16} 
              className={`hidden sm:block text-slate-400 group-hover:text-amber-400 transition-all ${
                showProfileMenu ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 animate-slideIn">
                <div className="p-4 border-b-2 border-slate-200">
                  <p className="font-bold text-slate-900">{user?.name ?? "Guest"}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.email ?? "guest@example.com"}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => navigate('/dashboard/profile')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                    <User size={16} className="text-slate-600 group-hover:text-amber-600" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      My Profile
                    </span>
                  </button>
                </div>
                <div className="p-2 border-t-2 border-slate-200">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left group">
                    <LogOut size={16} className="text-red-600" />
                    <span className="text-sm font-bold text-red-600">
                      Logout
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;