import { Link } from "react-router-dom";
import { Scale, Menu, X } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const Header = () => {
  const logoHeaderRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(() => {
    const icon = document.getElementById("logo");
    const wrapper = logoHeaderRef.current;
    if (!icon || !wrapper) return;

    const tl = gsap.timeline({ paused: true });
    tl.to(icon, {
      rotate: 12,
      duration: 0.1,
      ease: "power2.inOut",
    });
    const handleEnter = () => tl.play();
    const handleLeave = () => tl.reverse();

    wrapper.addEventListener("mouseenter", handleEnter);
    wrapper.addEventListener("mouseleave", handleLeave);

    return () => {
      wrapper.removeEventListener("mouseenter", handleEnter);
      wrapper.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-500/20 shadow-2xl">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div ref={logoHeaderRef} className="flex items-center gap-3 cursor-pointer">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-2 rounded-xl shadow-lg border border-slate-700">
            <Scale id="logo" className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <Link to="/" className="text-xl font-bold text-amber-400 tracking-tight hover:text-amber-300 transition-colors duration-300">
            Nyay Setu
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
            className="p-2 rounded-xl hover:bg-slate-800 transition-all duration-300"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-slate-400" />
            ) : (
              <Menu className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <ul className="flex gap-6">
            <li>
              <Link 
                to="/" 
                className="text-slate-300 hover:text-amber-400 transition-colors duration-300 font-medium"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/mock-trials" 
                className="text-slate-300 hover:text-amber-400 transition-colors duration-300 font-medium"
              >
                Mock Trials
              </Link>
            </li>
            <li>
              <Link 
                to="/talk-to-lawyer" 
                className="text-slate-300 hover:text-amber-400 transition-colors duration-300 font-medium"
              >
                Connect with Lawyers
              </Link>
            </li>
          </ul>
          <div className="flex gap-3">
            <Link to="/signin">
              <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-gradient-to-br from-slate-800 to-slate-900 border-t border-slate-700/50 px-6 py-8 flex flex-col items-center space-y-5">
          <Link 
            to="/" 
            onClick={toggleMenu} 
            className="block text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors duration-300"
          >
            Home
          </Link>
          <Link 
            to="/mock-trials" 
            onClick={toggleMenu} 
            className="block text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors duration-300"
          >
            Mock Trials
          </Link>
          <Link 
            to="/talk-to-lawyer" 
            onClick={toggleMenu} 
            className="block text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors duration-300"
          >
            Connect with Lawyers
          </Link>
          <Link 
            to="/contact" 
            onClick={toggleMenu} 
            className="block text-sm font-medium text-slate-300 hover:text-amber-400 transition-colors duration-300"
          >
            Contact
          </Link>
          
          <div className="w-full border-t border-slate-700/50 pt-6 space-y-3 flex flex-col items-center">
            <Link to="/signin" onClick={toggleMenu} className="w-48">
              <button className="w-full px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300">
                Log In
              </button>
            </Link>
            <Link to="/signup" onClick={toggleMenu} className="w-48">
              <button className="w-full px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;