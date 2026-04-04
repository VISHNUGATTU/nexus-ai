import { motion } from "framer-motion";

export default function Title({ title, heading, description }) {
  return (
    <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
      {title && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 50 }}
          className="mb-6 inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
        >
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 uppercase tracking-widest">
            {title}
          </span>
        </motion.div>
      )}

      {heading && (
        <motion.h2
          className="text-3xl md:text-5xl text-white font-bold tracking-tight mb-6"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
            delay: 0.1,
          }}
        >
          {heading}
        </motion.h2>
      )}

      {description && (
        <motion.p
          className="max-w-2xl mx-auto text-base md:text-lg text-gray-400 leading-relaxed"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
            delay: 0.2,
          }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}