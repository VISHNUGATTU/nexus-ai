import { Check, Unlock, Terminal } from "lucide-react";
import { PrimaryButton } from "./Buttons";
import Title from "./Title";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();

  // Defined locally to highlight the free system-level capabilities
  const freeFeatures = [
    "Unlimited natural language commands",
    "Local application execution & management",
    "Automated web navigation & search",
    "Custom workflow scripting",
    "Full privacy & zero data retention",
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background AI ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-fuchsia-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        <Title
          title="Access"
          heading="Everything you need. 100% Free."
          description="We believe powerful system automation should be accessible to everyone. No paywalls, no credit cards, just pure execution power."
        />

        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
            delay: 0.2,
          }}
          className="max-w-4xl mx-auto mt-16 relative p-8 md:p-12 rounded-[2rem] border-2 border-fuchsia-500/50 bg-white/[0.05] backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
        >
          {/* Inner ambient glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 blur-[80px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="absolute top-0 left-8 px-4 py-1.5 bg-gradient-to-b from-fuchsia-500/20 to-transparent border-x border-b border-fuchsia-500/30 rounded-b-xl text-xs font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
            <Unlock className="w-3.5 h-3.5" />
            Open Beta
          </div>

          <div className="flex flex-col md:flex-row gap-12 md:gap-8 items-center mt-6 relative z-10">
            
            {/* Left Side: Pricing Info & CTA */}
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h3 className="text-2xl font-semibold mb-4 text-white">
                NexusAI Core
              </h3>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-6xl font-bold text-white tracking-tight">
                  $0
                </span>
                <span className="text-lg font-medium text-gray-400">
                  / forever
                </span>
              </div>

              <p className="text-base text-gray-400 mb-8 leading-relaxed">
                Get total control over your digital workspace. Transform your PC into a fully automated command center without spending a dime.
              </p>

              <PrimaryButton 
                onClick={() => navigate("/register")}
                className="w-full py-4 text-base gap-2"
              >
                <Terminal className="w-5 h-5 text-fuchsia-200" />
                Initialize Free Account
              </PrimaryButton>
            </div>

            {/* Right Side: Features List */}
            <div className="w-full md:w-1/2 bg-black/20 rounded-2xl p-6 md:p-8 border border-white/5">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
                Included capabilities
              </h4>
              <ul className="space-y-4">
                {freeFeatures.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-gray-300 leading-snug"
                  >
                    <div className="mt-0.5 shrink-0 rounded-full p-0.5 bg-fuchsia-500/20 text-fuchsia-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}