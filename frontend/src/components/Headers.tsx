import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
gsap.registerPlugin(ScrollTrigger);



const Header = () => {
  const logoHeaderRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const icon = document.getElementById("logo");
    const wrapper = logoHeaderRef.current;
    const tl = gsap.timeline({paused: true});
    tl.to(icon,
       {rotate: 12, duration: 0.1, ease: "power2.inOut", backgroundColor: "gray", borderRadius: "50%"}
      )
    const handleEnter = () => tl.play();
    const handleLeave = () => tl.reverse();

    wrapper?.addEventListener("mouseenter", handleEnter);
    wrapper?.addEventListener("mouseleave", handleLeave);

    return () => {
      wrapper?.removeEventListener("mouseenter", handleEnter);
      wrapper?.removeEventListener("mouseleave", handleLeave);
    };
  }, []);
  
  return (
    <header className="sticky top-0 z-10 w-full bg-white text-black shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center">
        
        {/* Logo */}
        <div ref={logoHeaderRef} className="text-2xl font-bold mb-2 gap-2 sm:mb-0 flex flex-row">
            <Scale id="logo" className="h-8 w-8"/>
            <Link to="/" className="hover:text-gray-700 transition duration-200">
              Law Connect
            </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mb-2 sm:mb-0">
          <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm font-medium">
            <li>
              <Link to="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gray-700">About</Link>
            </li>
            <li>
              <Link to="/mock-trials" className="hover:text-gray-700">Mock Trials</Link>
            </li>
            <li>
              <Link to="/case-info" className="hover:text-gray-700">Case Info</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gray-700">Contact</Link>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className="flex gap-2 text-sm">
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

      </div>
    </header>
  );
};

export default Header;
