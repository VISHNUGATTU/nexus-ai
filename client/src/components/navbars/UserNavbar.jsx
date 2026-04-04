import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, User, LogOut, ChevronDown, X, 
  Settings, Terminal, Shield, Plus, MessageSquare,
  MoreVertical, Pencil, Trash2, Check
} from "lucide-react";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const UserNavbar = ({ children }) => {
  const {
    logout, sidebarOpen, setSidebarOpen, profileOpen, setProfileOpen,
    user, authReady, userInfo, setUserInfo, backendUrl
  } = useAppContext();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [imgError, setImgError] = useState(false);
  
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      if (!authReady || !user?.token || user.role !== 'user') return;

      try {
        setLoadingProfile(true);
        if (!userInfo) {
          const res = await axios.get(`${backendUrl}/api/user/is-auth`);
          if (res.data.success) setUserInfo(res.data.user); 
        }

        const historyRes = await axios.get(`${backendUrl}/api/commands/history`);
        const historyData = historyRes.data.commands || historyRes.data.data || historyRes.data;
        if (Array.isArray(historyData)) setHistory(historyData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingProfile(false);
        setLoadingHistory(false);
      }
    };
    fetchData();
  }, [authReady, user, userInfo, setUserInfo, backendUrl, location.pathname]);

  /* ================= CLOSE PROFILE DROPDOWN ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen, setProfileOpen]);


  /* ================= CHAT ACTIONS ================= */
  const handleDeleteChat = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/commands/${id}`, { withCredentials: true });
      setHistory(history.filter(cmd => cmd._id !== id));
      
      // If the user deleted the chat they are currently viewing, send them to a new chat
      if (location.search.includes(id)) navigate("/user/dashboard");
    } catch (err) {
      toast.error("Failed to delete chat.");
    }
  };

  const handleRenameChat = async (id, newTitle) => {
    try {
      await axios.put(`${backendUrl}/api/commands/${id}/title`, { title: newTitle }, { withCredentials: true });
      setHistory(history.map(cmd => cmd._id === id ? { ...cmd, title: newTitle } : cmd));
    } catch (err) {
      toast.error("Failed to rename chat.");
    }
  };

  /* ================= DATE GROUPING LOGIC ================= */
  const groupHistoryByDate = (historyArray) => {
    const groups = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Older": []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    historyArray.forEach(cmd => {
      const cmdDate = new Date(cmd.createdAt);
      cmdDate.setHours(0, 0, 0, 0);

      if (cmdDate.getTime() === today.getTime()) {
        groups["Today"].push(cmd);
      } else if (cmdDate.getTime() === yesterday.getTime()) {
        groups["Yesterday"].push(cmd);
      } else if (cmdDate.getTime() > lastWeek.getTime()) {
        groups["Previous 7 Days"].push(cmd);
      } else {
        groups["Older"].push(cmd);
      }
    });

    return groups;
  };

  const groupedHistory = groupHistoryByDate(history);

  /* ================= LOADING & HELPERS ================= */
  if (!authReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#05050A]">
        <div className="relative w-12 h-12 flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-2 border-white/10 border-t-fuchsia-500 rounded-full animate-spin"></div>
          <Terminal size={20} className="text-fuchsia-500 animate-pulse" />
        </div>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Initializing Environment...</p>
      </div>
    );
  }

  const getProfileImage = () => {
    if (userInfo?.avatarUrl && !imgError) return userInfo.avatarUrl;
    const name = userInfo?.username || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&bold=true`;
  };

  return (
    <div className="flex h-screen bg-[#05050A] text-gray-200 font-sans overflow-hidden selection:bg-fuchsia-500/30">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-screen pointer-events-none z-0" />

      {/* ================= SIDEBAR ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0F]/95 backdrop-blur-2xl border-r border-white/10 transition-transform duration-300 ease-in-out shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-white/5 border-b border-white/5 shrink-0">
          <Link to="/user/dashboard" className="flex items-center gap-2 relative z-10">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]">
               <Terminal size={18} color="white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">AI</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors lg:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation & History */}
        <nav className="flex-1 flex flex-col mt-6 px-3 relative z-10 overflow-hidden">
          <button 
            onClick={() => {
              navigate("/user/dashboard");
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 mb-4 w-full rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-fuchsia-500/50 transition-all duration-300 group shadow-lg shrink-0"
          >
            <Plus size={18} className="text-fuchsia-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium tracking-wide">New Command</span>
          </button>

          {/* Scrollable History List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-24">
            {loadingHistory ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-fuchsia-500/50 border-t-fuchsia-500 rounded-full animate-spin"></div>
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-600">No commands yet.</div>
            ) : (
              // Map over the grouped dates
              Object.keys(groupedHistory).map((dateLabel) => {
                if (groupedHistory[dateLabel].length === 0) return null;
                return (
                  <div key={dateLabel}>
                    <p className="px-3 text-[10px] font-mono font-bold text-gray-500 uppercase mb-2 tracking-[0.15em] shrink-0">
                      {dateLabel}
                    </p>
                    <div className="space-y-0.5">
                      {groupedHistory[dateLabel].map((cmd) => (
                        <SideHistoryItem 
                          key={cmd._id} 
                          cmd={cmd}
                          closeSidebar={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                          onDelete={handleDeleteChat}
                          onRename={handleRenameChat}
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[#0A0A0F] to-transparent shrink-0">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 text-sm font-medium tracking-wide shadow-lg">
            <LogOut size={16} /> <span>Sever Connection</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64 relative z-10`}>
        
        <header className="h-16 bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors lg:hidden focus:outline-none">
              <Menu size={20} />
            </button>
            <Link to="/user/dashboard" className={`flex items-center gap-2 lg:hidden`}>
               <span className="text-white font-bold text-lg tracking-tight">Nexus<span className="text-fuchsia-500">AI</span></span>
            </Link>
            <div className="hidden lg:flex items-center text-xs font-mono text-gray-500 tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Shield size={12} className="mr-2 text-green-400" /> Connection Secure
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all focus:outline-none group">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate max-w-[160px]">
                    {loadingProfile ? "Loading..." : userInfo?.username || "System User"}
                  </p>
                </div>
                <div className="relative">
                  {loadingProfile ? (
                    <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse border border-white/20" />
                  ) : (
                    <img src={getProfileImage()} alt="Profile" onError={() => setImgError(true)} className="h-9 w-9 rounded-full object-cover border border-white/20 shadow-[0_0_10px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-shadow" />
                  )}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#0A0A0F]"></span>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 mr-1 ${profileOpen ? "rotate-180 text-fuchsia-400" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#0F0F16] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 py-2 animate-fade-in-up origin-top-right">
                  <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/[0.02]">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Authenticated as</p>
                    <p className="text-sm text-white font-medium mt-1 truncate">@{userInfo?.username || "user"}</p>
                  </div>
                  <div className="px-2 space-y-1">
                    <DropdownItem to="/user/profile" icon={<User size={16} />} text="Identity Profile" />
                    <DropdownItem to="/user/settings" icon={<Settings size={16} />} text="System Preferences" />
                  </div>
                  <div className="border-t border-white/5 my-2"></div>
                  <div className="px-2">
                    <button onClick={logout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors font-medium">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-900/10 blur-[150px] rounded-full pointer-events-none" />
           <div className="relative z-10 h-full flex flex-col">
             {children}
           </div>
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168,85,247,0.5); }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

/* ================= COMPONENT: SIDE HISTORY ITEM ================= */
const SideHistoryItem = ({ cmd, closeSidebar, onDelete, onRename }) => {
  const location = useLocation();
  const isActive = location.search.includes(cmd._id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(cmd.title || cmd.prompt);

  const formatTitle = (text) => {
    if (!text) return "Empty Command";
    const words = text.split(" ");
    return words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editValue.trim() && editValue !== cmd.title) {
      onRename(cmd._id, editValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-fuchsia-500/50 rounded-xl">
        <input 
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          className="bg-transparent text-sm text-white outline-none w-full"
        />
        <button type="submit" className="text-green-400 hover:text-green-300"><Check size={14}/></button>
      </form>
    );
  }

  const displayText = cmd.title ? cmd.title : formatTitle(cmd.prompt);

  return (
    <div className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer
      ${isActive 
          ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"}`}
    >
      <Link
        to={`/user/dashboard?chat=${cmd._id}`}
        onClick={closeSidebar}
        className="flex items-center gap-3 flex-1 overflow-hidden"
      >
        <MessageSquare size={16} className={`shrink-0 ${isActive ? 'text-fuchsia-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
        <span className="truncate text-sm font-medium pr-6">{displayText}</span>
      </Link>

      {/* Hover Action Buttons */}
      <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-[#0A0A0F] via-[#0A0A0F] to-transparent pl-4">
        <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(cmd._id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const DropdownItem = ({ to, text, icon }) => (
  <Link to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200">
    <span className="text-gray-500">{icon}</span> {text}
  </Link>
);

export default UserNavbar;