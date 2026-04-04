import { Sparkles } from "lucide-react";
import { PrimaryButton } from "./Buttons"; 
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-20 2xl:pb-32 px-4 relative overflow-hidden">
      {/* Ambient background glow for the whole section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] p-12 md:p-20 text-center relative overflow-hidden backdrop-blur-xl shadow-2xl">
          
          {/* Decorative inner glowing orbs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-600/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
          
          {/* Texture overlay */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay" />

          <div className="relative z-20">
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 50 }}
            >
              Ready to amplify your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">potential?</span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.1 }}
            >
              Join thousands of professionals who are already using our AI Assistant to write better code, draft flawless emails, and solve complex problems in seconds.
            </motion.p>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.2 }}
            >
              {/* Swapped GhostButton for PrimaryButton to make the CTA truly pop */}
              <PrimaryButton className="px-8 py-4 text-base gap-3">
                <Sparkles size={20} className="text-fuchsia-200" />
                Start Chatting for Free
              </PrimaryButton>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}