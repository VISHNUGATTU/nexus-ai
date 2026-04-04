import { useRef } from "react";
import Title from "./Title";
import { motion } from "framer-motion";
import { TerminalSquare, Globe, Network } from "lucide-react"; // Updated icons for actions

export default function Features() {
  const refs = useRef([]);

  // Moved data into the component to perfectly match the new Action theme
  const actionFeaturesData = [
    {
      icon: <TerminalSquare className="w-6 h-6" />,
      title: "Local System Control",
      desc: "Instantly launch desktop applications like VS Code, WhatsApp, or Mail without ever touching your mouse or searching through menus.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Seamless Web Navigation",
      desc: "Direct the assistant to open specific URLs, search YouTube for tutorials, or pull up web dashboards with a single natural language command.",
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Workflow Automation",
      desc: "Chain complex actions together. Open your development environment, start a local server, and launch your browser simultaneously.",
    },
  ];

  return (
    <section id="features" className="py-20 2xl:py-32 relative">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-fuchsia-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Title
          title="Core Capabilities"
          heading="Automate your digital life"
          description="Stop clicking around. Execute complex workflows, launch local applications, and navigate the web using simple, natural language commands."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {actionFeaturesData.map((feature, i) => (
            <motion.div
              ref={(el) => {
                refs.current[i] = el;
              }}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 70,
                mass: 1,
                delay: 0.1 + i * 0.1,
              }}
              key={i}
              onAnimationComplete={() => {
                const card = refs.current[i];
                if (card) {
                  // Enhanced hover states added dynamically after entrance animation
                  card.classList.add(
                    "transition-all",
                    "duration-300",
                    "hover:border-fuchsia-500/30",
                    "hover:bg-white/[0.08]",
                    "hover:-translate-y-2",
                    "hover:shadow-[0_10px_40px_-10px_rgba(168,85,247,0.15)]"
                  );
                }
              }}
              className="rounded-3xl p-8 bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group"
            >
              {/* Inner subtle orb that appears on hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Upgraded Icon Container */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center mb-6 text-fuchsia-400 group-hover:scale-110 group-hover:text-white transition-all duration-300 relative z-10">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-white relative z-10">
                {feature.title}
              </h3>

              <p className="text-gray-400 text-base leading-relaxed relative z-10">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}