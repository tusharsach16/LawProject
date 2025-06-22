import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-10 w-full bg-black text-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center">
        
        {/* Logo */}
        <div className="text-2xl font-bold mb-2 sm:mb-0">
          <Link to="/" className="hover:text-gray-300 transition duration-200">
            Law Connect
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mb-2 sm:mb-0">
          <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm font-medium">
            <li>
              <Link to="/" className="hover:text-gray-400">Home</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gray-400">About</Link>
            </li>
            <li>
              <Link to="/mock-trials" className="hover:text-gray-400">Mock Trials</Link>
            </li>
            <li>
              <Link to="/case-info" className="hover:text-gray-400">Case Info</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gray-400">Contact</Link>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="flex gap-2 text-sm">
          <Link to="/signin">
            <button className="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 transition duration-200">
              Sign In
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-black border border-white px-4 py-1 rounded hover:bg-white hover:text-black transition duration-200">
              Sign Up
            </button>
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;
