import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { Lock, User, ChevronDown, Terminal, ArrowRight, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext"; 

// --- 3D LIBRARIES ---
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ===============================
   AI CORE BACKGROUND (Login Theme)
================================ */
const AIAgentCore = ({ agentState }) => {
  const coreRef = useRef();
  const materialRef = useRef();
  const targetColor = new THREE.Color();
  
  useFrame((state) => {
    if (!coreRef.current || !materialRef.current) return;

    let distort = 0.4;
    let speed = 2;
    let scale = 2.2; 

    if (agentState === "idle") {
      targetColor.set("#7c3aed"); // Deep Violet
    } else if (agentState === "typing") {
      targetColor.set("#d946ef"); // Fuchsia
      distort = 0.6;
      speed = 4;
    } else if (agentState === "error") {
      targetColor.set("#ef4444"); // Red
      distort = 1.2;
      speed = 15;
      coreRef.current.position.x = Math.sin(state.clock.elapsedTime * 60) * 0.2;
    } else if (agentState === "success") {
      targetColor.set("#10b981"); // Success Green
      scale = 3.0;
      distort = 0.1;
    }

    materialRef.current.color.lerp(targetColor, 0.05);
    materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, distort, 0.05);
    materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, speed, 0.05);
    coreRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

    coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, state.pointer.x * 0.8, 0.05);
    coreRef.current.rotation.x = THREE.MathUtils.lerp(coreRef.current.rotation.x, -state.pointer.y * 0.8, 0.05);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.5} 
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
};

/* ===============================
   LOGIN PAGE
================================ */
const Login = () => {
  const navigate = useNavigate();
  const { checkAuth, backendUrl } = useAppContext(); 

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user", 
  });

  const [loading, setLoading] = useState(false);
  const [agentState, setAgentState] = useState("idle");
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAgentState("typing");
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setAgentState("idle");
    }, 1000);
  };

  const triggerError = (msg) => {
    toast.error(msg);
    setAgentState("error");
    setTimeout(() => setAgentState("idle"), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || formData.password.length < 6) {
      triggerError("Authorization Failure: Invalid Credentials");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/${formData.role}/login`,
        formData,
        { withCredentials: true }
      );

      if (!data.success) {
        triggerError(data.message || "Access Denied");
        return;
      }

      setAgentState("success");
      toast.success("Identity Verified");
      sessionStorage.setItem("role", formData.role);
      await checkAuth();

      setTimeout(() => {
        navigate(formData.role === "admin" ? "/admin" : "/user");
      }, 1500);

    } catch (err) {
      triggerError("System Link Failure: Connection Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020205] relative overflow-hidden font-sans">
      
      {/* 0. BACK BUTTON */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 z-30 flex items-center gap-3 text-gray-500 hover:text-white transition-colors duration-300 group"
      >
        <div className="p-2.5 bg-white/5 rounded-full border border-white/10 group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-500/10 transition-all shadow-lg">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] hidden sm:block">Return to Base</span>
      </Link>

      {/* 1. 3D BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#a855f7" />
          <Environment preset="night" />
          <AIAgentCore agentState={agentState} />
        </Canvas>
      </div>

      {/* 2. OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05050A]/40 to-[#05050A] z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none z-10" />

      {/* 3. LOGIN CARD */}
      <div className={`relative z-20 w-full max-w-md px-6 transition-all duration-500 ${agentState === "error" ? "animate-shake" : ""}`}>
        
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Nexus<span className="text-fuchsia-500">AI</span>
            </h1>
            <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase font-mono mt-2">Secure Terminal Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ROLE SELECT */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fuchsia-400 z-10" size={18} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-black/40 text-white pl-12 pr-10 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="user">Standard User</option>
                <option value="admin">Root Admin</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={18} />
            </div>

            {/* USERNAME */}
            <div className="relative group">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fuchsia-400 z-10" size={18} />
              <input
                type="text"
                name="username"
                placeholder="ID Identifier"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-black/40 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fuchsia-400 z-10" size={18} />
              <input
                type="password"
                name="password"
                placeholder="Security Hash"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black/40 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-fuchsia-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 mt-6 transition-all duration-300 ${
                agentState === "error" ? "bg-red-600/20 text-red-500 border-red-500/50" : 
                agentState === "success" ? "bg-green-600/20 text-green-500 border-green-500/50" : 
                "bg-white text-black hover:bg-fuchsia-500 hover:text-white shadow-xl active:scale-95"
              }`}
            >
              {loading ? "Decrypting..." : agentState === "success" ? "Verified" : "Sync Neural Link"}
              {!loading && agentState !== "success" && <ArrowRight size={18} />}
            </button>
            
            <div className="text-center mt-8">
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  No clearance? <Link to="/register" className="text-fuchsia-400 hover:text-white transition-colors font-bold">Request Access</Link>
               </p>
            </div>
          </form>
        </div>
      </div>

      {/* FOOTER STATUS */}
      <div className="absolute bottom-8 w-full text-center z-20 pointer-events-none">
          <p className="font-mono text-[9px] text-fuchsia-400/30 uppercase tracking-[0.6em]">
            System Status: {agentState === 'error' ? 'Security Breach' : 'Online'}
          </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default Login;