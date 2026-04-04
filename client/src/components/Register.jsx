import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { Lock, Terminal, ArrowRight, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";

// --- 3D LIBRARIES ---
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ===============================
   AI CORE BACKGROUND
================================ */
const AIAgentCore = ({ agentState }) => {
  const coreRef = useRef();
  const materialRef = useRef();
  const targetColor = new THREE.Color();

  useFrame((state) => {
    if (!coreRef.current || !materialRef.current) return;

    let distort = 0.4;
    let speed = 2;
    let scale = 2.2; // Slightly larger for registration background

    if (agentState === "idle") {
      targetColor.set("#3b82f6"); // Corporate Blue
    } else if (agentState === "typing") {
      targetColor.set("#06b6d4"); // Cyan
      distort = 0.6;
      speed = 4;
    } else if (agentState === "error") {
      targetColor.set("#ef4444"); // Alert Red
      distort = 1.2;
      speed = 15;
      // Aggressive jitter on error
      coreRef.current.position.x = Math.sin(state.clock.elapsedTime * 60) * 0.2;
    } else if (agentState === "success") {
      targetColor.set("#10b981"); // Success Green
      scale = 2.8;
      distort = 0.1;
    }

    // Smooth transitions
    materialRef.current.color.lerp(targetColor, 0.05);
    materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, distort, 0.05);
    materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, speed, 0.05);
    coreRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

    // Subtle "Looking at you" effect
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
          opacity={0.5} // High transparency as requested
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
};

/* ===============================
   REGISTER PAGE
================================ */
const Register = () => {
  const navigate = useNavigate();
  const { backendUrl } = useAppContext();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    setTimeout(() => setAgentState("idle"), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return triggerError("Security Keys do not match");
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/user/register`, formData);

      if (data.success) {
        setAgentState("success");
        toast.success("Identity Created. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        triggerError(data.message || "Registration Failed");
      }
    } catch (err) {
      triggerError("System Link Failure: Server Unreachable");
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
        <div className="p-2.5 bg-white/5 rounded-full border border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all shadow-lg">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] hidden sm:block">Return to Base</span>
      </Link>

      {/* 1. 3D AGENT LAYER */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
          <Environment preset="night" />
          <AIAgentCore agentState={agentState} />
        </Canvas>
      </div>

      {/* 2. ATMOSPHERIC OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#05050A] via-transparent to-blue-500/10 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] pointer-events-none z-10" />

      {/* 3. FORM CARD */}
      <div className={`relative z-20 w-full max-w-lg px-6 transition-all duration-500 ${agentState === "error" ? "animate-shake" : ""}`}>
        
        <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
              Create <span className="text-blue-500">Identity</span>
            </h1>
            <p className="text-blue-400/50 text-[10px] tracking-[0.4em] uppercase font-mono mt-2">
              Protocol: New_User_Provisioning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* USERNAME */}
            <div className="relative group md:col-span-2">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16}/>
              <input
                type="text"
                name="username"
                placeholder="System Alias"
                required
                className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                onChange={handleChange}
              />
            </div>

            {/* EMAIL */}
            <div className="relative group md:col-span-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16}/>
              <input
                type="email"
                name="email"
                placeholder="Secure Email Channel"
                required
                className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                onChange={handleChange}
              />
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16}/>
              <input
                type="password"
                name="password"
                placeholder="Security Key"
                required
                className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                onChange={handleChange}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16}/>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Key"
                required
                className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl border border-white/5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`md:col-span-2 w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 mt-4 transition-all duration-300 ${
                agentState === 'success' ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-xl active:scale-95'
              }`}
            >
              {loading ? "Syncing..." : agentState === 'success' ? "Identity Confirmed" : "Initialize Profile"}
              <ArrowRight size={18}/>
            </button>

            <div className="md:col-span-2 text-center mt-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Existing Identity?{" "}
                <Link to="/login" className="text-blue-400 hover:text-white transition-colors font-bold">
                  Authorize Here
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* FOOTER STATUS */}
      <div className="absolute bottom-8 w-full text-center z-20 pointer-events-none">
          <p className="font-mono text-[9px] text-blue-400/40 uppercase tracking-[0.6em]">
            Connection Status: {agentState === 'error' ? 'Security Breach' : 'Encrypted'}
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

export default Register;