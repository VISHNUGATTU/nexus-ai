import { Zap, Cpu, ShieldCheck } from "lucide-react";
import Title from "./Title";
import { motion } from "framer-motion";

export default function About() {
  const valuesData = [
    {
      icon: <Zap className="w-6 h-6 text-fuchsia-400" />,
      title: "Action-Oriented AI",
      desc: "Designed to execute, not just converse. Every natural language command is instantly translated into native system actions for zero-friction workflows.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-violet-400" />,
      title: "Deep System Integration",
      desc: "We hook directly into your OS environment, allowing seamless control over local applications, file directories, and web browsers in milliseconds.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
      title: "Sandboxed Security",
      desc: "Your local data stays local. Strict permission boundaries and enterprise-grade encryption ensure your system and files remain entirely secure.",
    },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden z-10">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <Title
          title="About NexusAI"
          heading="Redefining how you interact with your PC"
          description="Built by a team of automation experts and systems engineers, NexusAI bridges the gap between natural language and local system execution. Stop clicking around—start commanding."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {valuesData.map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 50,
                delay: 0.1 + i * 0.15,
              }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 transition-all duration-500"
            >
              {/* Inner subtle orb that appears on hover */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                {item.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-white relative z-10">
                {item.title}
              </h3>

              <p className="text-gray-400 text-base leading-relaxed relative z-10">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Global Stats / Proof Section */}
        <motion.div 
          className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.4 }}
        >
        </motion.div>
      </div>
    </section>
  );
}