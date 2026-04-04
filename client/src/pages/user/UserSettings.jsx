import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings as SettingsIcon, User, Lock, 
  ShieldAlert, Save, Trash2, X 
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";

const UserSettings = () => {
  const { userInfo, setUserInfo, backendUrl } = useAppContext();

  // States for Credentials
  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  
  // States for Clearing History
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Load existing username on mount
  useEffect(() => {
    if (userInfo) setUsername(userInfo.username);
  }, [userInfo]);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  /* ================= UPDATE CREDENTIALS ================= */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // Basic validation if they are trying to change password
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New security keys do not match.");
    }

    try {
      setIsSaving(true);
      const res = await axios.put(
        `${backendUrl}/api/user/update`, 
        {
          username,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Identity credentials updated.");
        setUserInfo({ ...userInfo, username: res.data.user.username });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Reset fields
      } else {
        toast.error(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "System error. Could not update.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= CLEAR HISTORY ================= */
  const handleClearHistory = async () => {
    try {
      setIsClearing(true);
      const res = await axios.delete(`${backendUrl}/api/commands/clear-history`, {
        withCredentials: true
      });

      if (res.data.success) {
        toast.success("Execution history purged successfully.");
        setShowConfirmClear(false); // Reset the UI state back to default
      } else {
        toast.error(res.data.message || "Failed to clear history.");
      }
    } catch (err) {
      console.error(err);
      toast.error("System error. Could not purge history.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full relative z-10 pb-12">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-fuchsia-500" />
          System <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Settings</span>
        </h1>
        <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-mono mt-2">
          Dynamic Configuration & Security
        </p>
      </motion.div>

      <div className="space-y-6">
        
        {/* SECTION 1: IDENTITY & SECURITY */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <User className="text-fuchsia-400 w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Identity Credentials</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* USERNAME */}
            <div>
              <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2 ml-1">
                System Alias (Username)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* PASSWORD CHANGE */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Current Security Key (Required for changes)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><Lock size={16} /></div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-black/40 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  New Security Key
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><Lock size={16} /></div>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-black/40 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Confirm New Key
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"><Lock size={16} /></div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-black/40 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 focus:bg-black/60 transition-all font-mono text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                {isSaving ? "Syncing..." : "Update Credentials"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* SECTION 2: DANGER ZONE (CLEAR HISTORY) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-950/10 backdrop-blur-xl border border-red-500/20 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
          
          <div className="flex items-center gap-3 mb-6 border-b border-red-500/10 pb-4">
            <ShieldAlert className="text-red-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 min-h-[60px]">
            <div>
              <h3 className="text-white font-bold mb-1">Purge Execution History</h3>
              <p className="text-[11px] text-gray-500 font-mono leading-relaxed max-w-lg">
                Permanently delete all command logs, AI responses, and execution targets from the database. This action cannot be undone.
              </p>
            </div>
            
            {/* INLINE UI CONFIRMATION TOGGLE */}
            <div className="shrink-0">
              {!showConfirmClear ? (
                <button 
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 transition-all font-bold text-sm uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                  Clear History
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-red-950/40 p-2 rounded-xl border border-red-500/30"
                >
                  <button 
                    onClick={() => setShowConfirmClear(false)}
                    disabled={isClearing}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button 
                    onClick={handleClearHistory}
                    disabled={isClearing}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  >
                    {isClearing ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <ShieldAlert size={14} />}
                    {isClearing ? "Purging..." : "Confirm Purge"}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default UserSettings;