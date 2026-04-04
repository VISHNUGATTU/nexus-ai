import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  User, Mail, Shield, Camera, Upload, 
  Terminal, ShieldCheck, Activity 
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const UserProfile = () => {
  const { userInfo, setUserInfo, backendUrl } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  /* ================= FALLBACK AVATAR LOGIC ================= */
  const getProfileImage = () => {
    if (userInfo?.avatarUrl) return userInfo.avatarUrl;
    const name = userInfo?.username || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&bold=true&size=200`;
  };

  /* ================= HANDLE AVATAR UPLOAD ================= */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return toast.error("Invalid format. Please upload an image file.");
    }

    const formData = new FormData();
    formData.append("image", file); // Must match 'upload.single("image")' in your backend

    try {
      setIsUploading(true);
      
      const res = await axios.post(
        `${backendUrl}/api/user/avatar`, 
        formData, 
        { 
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      if (res.data.success) {
        toast.success("Identity visual updated successfully");
        // Update the global context so the Navbar updates instantly!
        setUserInfo({ ...userInfo, avatarUrl: res.data.avatarUrl || res.data.user?.avatarUrl });
      } else {
        toast.error(res.data.message || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      toast.error("System error. Upload failed.");
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!userInfo) return null; // Wait for context to load

  return (
    <div className="max-w-4xl mx-auto w-full relative z-10">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <User className="w-8 h-8 text-fuchsia-500" />
          Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Profile</span>
        </h1>
        <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-mono mt-2">
          System Clearance Records
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: AVATAR CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-fuchsia-500/10 to-transparent pointer-events-none" />

          {/* HIDDEN FILE INPUT */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />

          {/* AVATAR RING */}
          <div className="relative group cursor-pointer mb-6" onClick={() => !isUploading && fileInputRef.current.click()}>
            <div className={`absolute -inset-1 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 ${isUploading ? 'bg-fuchsia-500 animate-pulse' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 group-hover:duration-200'}`}></div>
            
            <div className="relative w-32 h-32 rounded-full bg-[#05050A] p-1 overflow-hidden">
              <img 
                src={getProfileImage()} 
                alt="Profile Avatar" 
                className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${isUploading ? 'opacity-30' : 'group-hover:opacity-40'}`}
              />
              
              {/* Upload Overlay */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isUploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest">Syncing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] font-mono text-white uppercase tracking-widest">Update</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 p-2 bg-[#05050A] rounded-full border border-white/10 text-fuchsia-400 shadow-lg">
              <Camera size={14} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">@{userInfo.username}</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-fuchsia-400 mt-2">
            <ShieldCheck size={12} />
            {userInfo.role || "User"} Clearance
          </div>
        </motion.div>


        {/* RIGHT COLUMN: READONLY SYSTEM DATA */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gray-500" />
              Encrypted Data Core
            </h3>
            <span className="flex items-center gap-2 text-[10px] text-green-400 font-mono uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <Activity size={12} className="animate-pulse" />
              Active
            </span>
          </div>

          <div className="space-y-6">
            
            {/* USERNAME FIELD */}
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
                  readOnly
                  value={userInfo.username}
                  className="w-full bg-black/40 text-gray-300 pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none cursor-not-allowed font-mono text-sm"
                />
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2 ml-1">
                Communication Link (Email)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  readOnly
                  value={userInfo.email}
                  className="w-full bg-black/40 text-gray-300 pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none cursor-not-allowed font-mono text-sm"
                />
              </div>
            </div>

            {/* ROLE FIELD */}
            <div>
              <label className="block text-[11px] font-mono text-gray-500 uppercase tracking-widest mb-2 ml-1">
                Access Level (Role)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-500/50">
                  <Shield size={16} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={(userInfo.role || "user").toUpperCase()}
                  className="w-full bg-fuchsia-900/10 text-fuchsia-300 pl-12 pr-4 py-4 rounded-2xl border border-fuchsia-500/20 outline-none cursor-not-allowed font-mono text-sm font-bold tracking-widest"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 shrink-0" />
             <p className="text-[11px] text-gray-500 font-mono leading-relaxed">
               System identifiers are securely hashed. Modification of core credentials requires root admin override. Click your visual identifier module to deploy a new avatar image.
             </p>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default UserProfile;