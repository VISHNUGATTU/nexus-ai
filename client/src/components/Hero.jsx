import { Terminal, ArrowRightIcon } from "lucide-react"; // Swapped Sparkles for Terminal to reflect commands
import { PrimaryButton } from "./Buttons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 

export default function Hero() {
  const navigate = useNavigate(); 

  const trustedUserImages = [
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=50",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop"
  ];

  // Swapped to an image that looks more like a developer terminal/command center
  const mainImageUrl =
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop";

  // Updated to reflect system actions and integrations instead of user types
  const actionLogosText = [
    "Launch Local Apps",
    "Web Navigation",
    "System Control",
    "Workflow Automation",
    "Task Execution",
  ];

  return (
    <>
      {/* HERO */}
      <section id="home" className="relative z-10 overflow-hidden">
        {/* Deep ambient AI background glows */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-violet-600/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 min-h-[90vh] pt-32 pb-20 flex items-center justify-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* LEFT CONTENT */}
            <div className="text-left">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.1 }}
              >
                Command your PC with <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400">
                  next-gen AI.
                </span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-400 max-w-lg mb-10 leading-relaxed"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.2 }}
              >
                Stop clicking around. Use natural language to instantly open VS Code, navigate to YouTube, launch your mail, or execute complex system workflows in milliseconds.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center gap-4"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.3 }}
              >
                {/* Dynamically linked to the Login page */}
                <PrimaryButton 
                  onClick={() => navigate("/login")} 
                  className="w-full sm:w-auto py-3.5 px-8 text-base gap-3"
                >
                  <Terminal className="size-5 text-fuchsia-200" />
                  Access Command Center
                </PrimaryButton>
              </motion.div>
            </div>

            {/* RIGHT MOCKUP */}
            <motion.div
              className="w-full mx-auto max-w-2xl lg:max-w-none relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.4 }}
            >
              {/* Outer glowing frame to simulate an app window */}
              <div className="rounded-2xl p-2 bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]">
                <div className="rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 relative aspect-video">
                  
                  {/* Fake macOS style app header */}
                  <div className="absolute top-0 w-full h-8 bg-white/5 flex items-center px-4 gap-2 z-20 backdrop-blur-md border-b border-white/5">
                    <div className="size-2.5 rounded-full bg-red-500/80" />
                    <div className="size-2.5 rounded-full bg-yellow-500/80" />
                    <div className="size-2.5 rounded-full bg-green-500/80" />
                    {/* Added a subtle terminal title for realism */}
                    <div className="ml-4 text-[10px] text-gray-500 font-mono tracking-widest">nexus_core_terminal ~</div>
                  </div>

                  <img
                    src={mainImageUrl}
                    alt="AI Command Interface Preview"
                    className="w-full h-full object-cover opacity-70 mix-blend-lighten mt-8"
                  />
                  
                  {/* Subtle inner overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* TEXT MARQUEE */}
      <motion.section
        className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="w-full overflow-hidden py-5">
            <div className="flex gap-16 items-center justify-center animate-marquee whitespace-nowrap">
              {actionLogosText.concat(actionLogosText).map((text, i) => (
                <span
                  key={i}
                  className="mx-8 text-sm md:text-base font-medium text-gray-500 hover:text-fuchsia-400 tracking-wider uppercase transition-colors duration-300 font-mono"
                >
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}