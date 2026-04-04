import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export const AppContext = createContext();

// ✅ Global Config
const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true; // CRITICAL: Tells Axios to send the HTTP-Only cookie

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ Streamlined State
  // 'token' is now just a boolean indicating if they are logged in, we don't store the actual string!
  const [user, setUser] = useState({ token: false, role: null }); 
  const [userInfo, setUserInfo] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // ✅ Layout UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  // ✅ 1. Check Auth 
  const checkAuth = useCallback(async () => {
    try {
      // We stored the role in sessionStorage during Login.jsx
      const role = sessionStorage.getItem("role");

      if (!role) {
        setUser({ token: false, role: null });
        setUserInfo(null);
        setAuthReady(true);
        return;
      }

      // Verify the secure cookie with the backend
      const endpoint = role === "admin" ? "/api/admin/users" : "/api/user/is-auth"; 
      
      const { data } = await axios.get(endpoint); 

      // If the request succeeds, the cookie is valid!
      setUser({ token: true, role: role });
      setUserInfo(data.user || data.admin || { username: "Admin" }); 

    } catch (error) {
      console.error("Auth check error:", error);
      // If cookie is expired/invalid, clear everything
      setUser({ token: false, role: null });
      setUserInfo(null);
      sessionStorage.removeItem("role");
    } finally {
      setAuthReady(true);
    }
  }, []);

  // ✅ 2. Run checkAuth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ Logout helper
  const logout = async () => {
    try {
      const role = user.role || sessionStorage.getItem("role") || "user";
      
      // Tell backend to destroy the HTTP-Only cookie
      await axios.post(`/api/${role}/logout`);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      // Clear frontend state regardless of backend success
      sessionStorage.removeItem("role");
      setUser({ token: false, role: null });
      setUserInfo(null);
      
      // Updated to match the new NexusAI Command Center theme!
      toast.success("Disconnected from NexusAI Command Center");
      
      // Successfully routing back to the main landing page
      navigate("/");
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Auth Data
        user,
        userInfo,
        setUserInfo,
        authReady,
        
        // Auth Actions
        checkAuth,
        logout,
        
        // UI State
        sidebarOpen,
        setSidebarOpen,
        profileOpen,
        setProfileOpen,
        
        // Utils
        axios,
        backendUrl
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);