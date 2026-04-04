import { motion } from "framer-motion";

export default function SoftBackdrop() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#05050A] overflow-hidden pointer-events-none">
      {/* Subtle noise texture overlay to add a premium tactile feel */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-screen" />

      {/* Top Left/Center Violet Glow */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full bg-violet-600/10 blur-[120px]"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Bottom Right Fuchsia Glow */}
      <motion.div
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-fuchsia-600/10 blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1, // Offsets the breathing so they aren't perfectly synchronized
        }}
      />
      
      {/* Center Deep Blue Accent (Floats slowly) */}
      <motion.div
        className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-600/5 blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}