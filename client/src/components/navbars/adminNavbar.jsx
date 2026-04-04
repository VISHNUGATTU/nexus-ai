import React, { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FiMenu, FiUser, FiLogOut, FiChevronDown, FiX, 
  FiSettings, FiBell, FiTerminal, FiUsers, FiActivity
} from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";

const adminNavbar = ({ children }) => {
  const {
    logout,
    sidebarOpen,
    setSidebarOpen,
    profileOpen,
    setProfileOpen,
    user,
    authReady,
    userInfo, 
  } = useAppContext();

  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  /* ================= CLOSE PROFILE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen, setProfileOpen]);

  if (!authReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Fallback avatar for Admin
  const getProfileImage = () => {
    const name = userInfo?.username || "Admin";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=22d3ee&bold=true`;
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-400 transition-transform duration-300 shadow-xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-black/20 border-b border-white/5">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-lg shadow-lg shadow-cyan-500/20">
               <FiTerminal size={18} color="white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Mike <span className="text-cyan-400">AI</span></span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="mt-6 space-y-1 pl-4 pr-2">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Root Access</p>
          <SideItem to="/admin/dashboard" icon={<FiActivity />} text="System Dashboard" end />
          <SideItem to="/admin/users" icon={<FiUsers />} text="User Management" />

          <div className="my-4 border-t border-slate-800/50 mx-4"></div>

          <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Admin Account</p>
          <SideItem to="/admin/profile" icon={<FiUser />} text="My Profile" />
          <SideItem to="/admin/settings" icon={<FiSettings />} text="System Settings" />
        </nav>

        <div className="absolute bottom-6 w-full px-6">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-red-500/10 hover:border-red-500/50 text-slate-300 hover:text-red-400 py-2.5 rounded-lg border border-transparent transition-all duration-200"
          >
            <FiLogOut />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0"}`}>
        
        <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-40 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-cyan-600 transition-colors focus:outline-none"
            >
              <FiMenu size={24} />
            </button>
            <Link 
              to="/admin/dashboard" 
              className={`flex items-center gap-2 ${sidebarOpen ? "lg:hidden" : ""}`}
            >
               <span className="text-slate-800 font-bold text-xl tracking-tight">Mike <span className="text-cyan-600">AI</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* System Alert Bell */}
            <button className="relative p-2 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
              <FiBell size={22} />
              {/* Optional: Add a red dot if there are system alerts */}
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all focus:outline-none group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-cyan-600 transition-colors">
                    {userInfo?.username || "System Admin"}
                  </p>
                  <p className="text-xs text-red-500 font-bold uppercase tracking-wider">
                    ROOT ACCESS
                  </p>
                </div>

                <div className="relative">
                  <img
                    src={getProfileImage()}
                    alt="Admin"
                    onError={() => setImgError(true)}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-shadow bg-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                
                <FiChevronDown
                  className={`text-slate-400 transition-transform duration-200 mx-1 ${profileOpen ? "rotate-180 text-cyan-600" : ""}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 ring-1 ring-black ring-opacity-5 py-1">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">Authenticated as</p>
                    <p className="text-sm text-slate-500 truncate">@{userInfo?.username || "admin"}</p>
                  </div>
                  <div className="py-1">
                    <DropdownItem to="/admin/profile" icon={<FiUser />} text="Admin Profile" />
                    <DropdownItem to="/admin/settings" icon={<FiSettings />} text="System Settings" />
                  </div>
                  <div className="border-t border-slate-100 my-1"></div>
                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <FiLogOut size={16} /> Terminate Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

/* ================= HELPERS ================= */

const SideItem = ({ to, icon, text, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-r-full mr-4 border-l-4
      ${isActive 
          ? "bg-cyan-600/10 text-cyan-400 border-cyan-500" 
          : "border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}`
    }
  >
    <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
    <span>{text}</span>
  </NavLink>
);

const DropdownItem = ({ to, text, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-2 px-4 py-2 text-sm transition-colors
      ${isActive ? "bg-cyan-50 text-cyan-600" : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-600"}`
    }
  >
    {icon && <span className="text-slate-400 hover:text-cyan-600">{icon}</span>}
    {text}
  </NavLink>
);

export default adminNavbar;