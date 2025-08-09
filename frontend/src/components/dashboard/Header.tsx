import { Menu } from "lucide-react";
import { useAppSelector } from "../../redux/hooks";

type HeaderProps = {
  onToggleSidebar: () => void;
};

function Header({ onToggleSidebar }: HeaderProps) {
  const { user } = useAppSelector((s) => s.user);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
      {/* Left: toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition lg:hidden" 
        >
          <Menu size={20} />
        </button>

        {/* Logo + Site name */}
        <div className="flex items-center gap-2 ml-1">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-none">
            MyDashboard
          </span>
        </div>
      </div>

      {/* Right: profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-transparent dark:border-gray-700 shadow-sm">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {user?.name ?? "Guest"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role ?? "Visitor"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
