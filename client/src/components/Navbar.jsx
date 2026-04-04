import { MenuIcon, XIcon, Terminal } from "lucide-react"; // Note: Kept Terminal to match your action theme!
import { PrimaryButton } from "./Buttons";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom"; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate(); 
  const location = useLocation(); // Hook to know our current page and hash

  // 1. Handle subtle background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Automatically scroll to elements if coming from another page (like Login)
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const targetId = location.hash.substring(1); // Remove the '#'
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          // Calculate position minus 100px to account for the fixed navbar
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100); // Tiny delay to ensure page is rendered
    } else if (location.pathname === "/" && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Capabilities", to: "/#features" }, 
    { name: "About", to: "/#about" },
    { name: "Pricing", to: "/#pricing" }, 
    { name: "Contact", to: "/#contact" },
    { name: "Docs", to: "/docs" },
  ];

  // 3. Custom click handler for same-page smooth scrolling with offset
  const handleNavClick = (e, path) => {
    setIsOpen(false);

    // If we are ALREADY on the landing page, intercept the click and scroll manually
    if (location.pathname === "/") {
      if (path === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/"); // Clean the URL
      } else if (path.startsWith("/#")) {
        e.preventDefault();
        const targetId = path.substring(2); // Remove "/#"
        const element = document.getElementById(targetId);
        
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100; // 100px offset
          window.scrollTo({ top: y, behavior: "smooth" });
          window.history.pushState(null, "", path); // Update URL hash
        }
      }
    }
    // If we are on /login or /register, let React Router handle it normally
  };

  return (
    <motion.nav
      className="fixed top-4 left-0 right-0 z-50 px-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
    >
      {/* Floating Pill Navigation */}
      <div 
        className={`max-w-5xl mx-auto flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 border ${
          scrolled 
            ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
            : "bg-black/20 backdrop-blur-md border-white/5"
        }`}
      >
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={(e) => handleNavClick(e, "/")}
          className="flex items-center gap-2 text-white font-bold text-lg tracking-tight relative z-50"
        >
          <Terminal className="w-5 h-5 text-fuchsia-500" />
          NexusAI
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          {navLinks.map((link) => (
            <Link
              to={link.to}
              key={link.name}
              onClick={(e) => handleNavClick(e, link.to)}
              className="hover:text-fuchsia-400 transition-colors duration-300 relative group flex flex-col"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-fuchsia-500 rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6 relative z-50">
          <button 
            onClick={() => { setIsOpen(false); navigate("/login"); }}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
          >
            Sign in
          </button>
          <PrimaryButton onClick={() => { setIsOpen(false); navigate("/register"); }} className="py-2 px-5 text-sm">
            Get Started
          </PrimaryButton>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-gray-300 hover:text-white transition-colors relative z-50"
          aria-label="Toggle menu"
        >
          {isOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-fuchsia-600/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center gap-6 text-xl font-medium relative z-10">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <Link 
                    to={link.to} 
                    onClick={(e) => handleNavClick(e, link.to)}
                    className="text-gray-300 hover:text-fuchsia-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="flex flex-col items-center gap-4 mt-8 w-full px-8 relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => { setIsOpen(false); navigate("/login"); }}
                className="w-full py-3 font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </button>
              <PrimaryButton className="w-full py-3 text-base" onClick={() => { setIsOpen(false); navigate("/register"); }}>
                Get Started
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}