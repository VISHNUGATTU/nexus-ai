import { ChevronDownIcon } from "lucide-react";
import Title from "./Title";
import { faqData } from "../assets/dummy-data";
import { useRef } from "react";
import { motion } from "framer-motion";

export default function Faq() {
  const refs = useRef([]);

  return (
    <section id="faq" className="py-20 2xl:py-32 relative">
      {/* Subtle background glow to tie into the AI theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 relative z-10">

        <Title
          title="FAQ"
          heading="Frequently asked questions"
          description="Everything you need to know about our AI assistant. Learn about capabilities, data privacy, and how to get the most out of your prompts."
        />

        <div className="space-y-4 mt-12">
          {faqData.map((faq, i) => (
            <motion.details
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
                  card.classList.add("transition-all", "duration-300");
                }
              }}
              className="group bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] rounded-2xl select-none backdrop-blur-md overflow-hidden"
            >
              {/* Added list-none to hide default browser arrow */}
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <h4 className="text-base md:text-lg font-medium text-gray-200 group-open:text-fuchsia-400 transition-colors duration-300">
                  {faq.question}
                </h4>
                <div className="ml-4 shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-open:border-fuchsia-500/30 transition-colors duration-300">
                  <ChevronDownIcon className="w-5 h-5 text-gray-400 group-open:text-fuchsia-400 group-open:rotate-180 transition-all duration-300" />
                </div>
              </summary>

              <div className="px-6 pb-6 text-sm md:text-base text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
                {faq.answer}
              </div>
            </motion.details>
          ))}
        </div>

      </div>
    </section>
  );
}