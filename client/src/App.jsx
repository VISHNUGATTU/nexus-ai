import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import axios from "axios";
import { Sparkles, Terminal } from "lucide-react"; 

/* ---------- Landing Page Components ---------- */
import Navbar from "./components/Navbar";
import SoftBackdrop from "./components/SoftBackdrop";
import Footer from "./components/Footer";
import LenisScroll from "./components/lenis";
import ScrollToTop from "./components/ScrollToTop";

import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";     
import Pricing from "./components/Pricing"; 
import Contact from "./components/Contact"; 

/* ---------- Auth ---------- */
import Login from "./components/Login";
import Register from "./components/Register";
import Docs from "./components/Docs";

/* ---------- Navbars ---------- */
import AdminNavbar from "./components/navbars/AdminNavbar";
import UserNavbar from "./components/navbars/UserNavbar";

/* ---------- Admin Pages ---------- */
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";

/* ---------- User Pages ---------- */
import UserChatAgent from "./pages/user/UserChatAgent";
import UserCommandHistory from "./pages/user/UserCommandHistory";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";

/* ---------- Global Config ---------- */
axios.defaults.withCredentials = true;

/* ---------- Reusable Loading Screen ---------- */
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#05050A] relative overflow-hidden">
    <div className="absolute w-[400px] h-[400px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-white/5 border-t-fuchsia-500 rounded-full animate-spin"></div>
        <Terminal className="w-5 h-5 text-violet-400 animate-pulse" />
      </div>
      <p className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-medium tracking-widest animate-pulse text-sm uppercase">
        Initializing Workspace...
      </p>
    </div>
  </div>
);

/* ---------- Landing Page Layout ---------- */
const LandingPage = () => {
  return (
    <div className="bg-[#05050A] min-h-screen text-gray-200 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden">
      <SoftBackdrop />
      <LenisScroll />
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
};

/* ---------- Protected Route (For Dashboard Pages) ---------- */
const ProtectedRoute = ({ children, role }) => {
  const { user, authReady } = useAppContext();

  if (!authReady) return <LoadingScreen />;

  // If not logged in, send to login
  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but wrong role, send back to their respective dashboard
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  return children;
};

/* ---------- Public Route (For Login/Register Pages) ---------- */
const PublicRoute = ({ children }) => {
  const { user, authReady } = useAppContext();

  if (!authReady) return <LoadingScreen />;

  // If the user IS logged in and tries to visit /login or /register, redirect them to their dashboard
  if (user?.token) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }

  return children;
};

/* ---------- Main App ---------- */
function App() {
  return (
    <>
      <ScrollToTop/>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
            borderRadius: "9999px",
            padding: "12px 24px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: '#d946ef', 
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* LANDING PAGE (Always accessible) */}
        <Route path="/" element={<LandingPage />} />

        {/* AUTH (Only accessible if NOT logged in) */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/docs" element={<PublicRoute><Docs /></PublicRoute>}/>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminNavbar>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminNavbar>
            </ProtectedRoute>
          }
        />

        {/* USER ROUTES */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute role="user">
              <UserNavbar>
                <Routes>
                  <Route path="dashboard" element={<UserChatAgent />} />
                  <Route path="history" element={<UserCommandHistory />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="settings" element={<UserSettings />} />
                  <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
                </Routes>
              </UserNavbar>
            </ProtectedRoute>
          }
        />

        {/* FALLBACK (Catch-all) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;