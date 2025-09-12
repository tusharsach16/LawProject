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
      backgroundColor: "gray",
      borderRadius: "50%",
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
    <header className="sticky top-0 z-20 w-full bg-white text-black shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        <div ref={logoHeaderRef} className="text-2xl font-bold flex items-center gap-2">
          <Scale id="logo" className="h-8 w-8" />
          <Link to="/" className="hover:text-gray-700 transition duration-200">
            Law Connect
          </Link>
        </div>

        <div className="sm:hidden">
          <button onClick={toggleMenu} aria-label="Toggle menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium">
          <ul className="flex gap-6">
            <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
            <li><Link to="/about" className="hover:text-gray-700">About</Link></li>
            <li><Link to="/mock-trials" className="hover:text-gray-700">Mock Trials</Link></li>
            <li><Link to="/talk-to-lawyer" className="hover:text-gray-700">Connect with Lawyers</Link></li>
            <li><Link to="/contact" className="hover:text-gray-700">Contact</Link></li>
          </ul>
          <div className="flex gap-2">
            <Link to="/signin">
              <button className="bg-white font-semibold text-black px-4 py-1 rounded hover:bg-gray-200 hover:scale-105 transition duration-200">
                LogIn
              </button>
            </Link>
            <Link to="/signup">
              <button className="text-white bg-black border-white px-4 py-1 rounded hover:bg-black hover:scale-105 transition duration-200">
                Sign Up
              </button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white shadow-md px-6 py-8 flex flex-col items-center justify-center space-y-5 text-center">
          <Link to="/" onClick={toggleMenu} className="block text-sm font-medium hover:text-gray-700">Home</Link>
          <Link to="/about" onClick={toggleMenu} className="block text-sm font-medium hover:text-gray-700">About</Link>
          <Link to="/mock-trials" onClick={toggleMenu} className="block text-sm font-medium hover:text-gray-700">Mock Trials</Link>
          {/* --- YEH LINK BHI THEEK KIYA GAYA HAI --- */}
          <Link to="/talk-to-lawyer" onClick={toggleMenu} className="block text-sm font-medium hover:text-gray-700">Connect with Lawyers</Link>
          <Link to="/contact" onClick={toggleMenu} className="block text-sm font-medium hover:text-gray-700">Contact</Link>
          
          <div className="w-full border-t border-gray-200 pt-4 space-y-3">
            <Link to="/signin" onClick={toggleMenu}>
              <button className="w-40 bg-white border border-black text-black py-2 rounded-md hover:bg-gray-100 transition">
                Log In
              </button>
            </Link>
            <Link to="/signup" onClick={toggleMenu}>
              <button className="w-40 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition">
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
