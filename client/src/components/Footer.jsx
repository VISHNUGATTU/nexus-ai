import { motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { Link } from "react-router-dom"; // Added for internal routing

export default function Footer() {
  // Pulling environment variables for external links
  const discordUrl = import.meta.env.VITE_DISCORD_URL || "https://discord.com/channels/1481234897287909438/1481234898303057926";
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com/your-repo/nexus-ai";

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Command Reference", url: "/docs#getting-started" },
        { name: "Supported Apps", url: "/docs#supported-apps" },
        { name: "Workflow Scripts", url: "/docs#workflow-scripts" },
        { name: "Release Notes", url: "/docs#release-notes" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", url: "/docs#introduction" },
        { name: "Security & Privacy", url: "/docs#security" },
        { name: "Local API Access", url: "/docs#local-api" },
      ],
    },
    {
      title: "Community",
      links: [
        { name: "Discord Server", url: discordUrl },
        { name: "GitHub Repository", url: githubUrl },
        { name: "Twitter / X", url: "https://twitter.com" },
      ],
    },
  ];

  return (
    <motion.footer
      className="relative bg-black/20 border-t border-white/10 pt-16 pb-6 text-gray-400 backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Subtle top border glowing gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
      
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 pb-12 border-b border-white/10">
          
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <Terminal className="w-6 h-6 text-fuchsia-500" />
              NexusAI
            </div>
            <p className="mt-6 text-sm leading-relaxed text-gray-400">
              Empowering power users and developers with next-generation local system automation. Execute workflows, control applications, and command your PC with natural language.
            </p>
          </div>

          <div className="flex flex-wrap justify-between w-full md:w-[50%] gap-8">
            {footerLinks.map((section, index) => (
              <div key={index} className="min-w-[120px]">
                <h3 className="font-semibold text-base text-white mb-6">
                  {section.title}
                </h3>

                <ul className="text-sm space-y-3">
                  {section.links.map((link, i) => {
                    // Check if it's an external link (http) or internal route (/docs)
                    const isExternal = link.url.startsWith("http");

                    return (
                      <li key={i}>
                        {isExternal ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-300 flex items-center gap-2 group"
                          >
                            <span className="w-1 h-1 rounded-full bg-fuchsia-500/0 group-hover:bg-fuchsia-500/100 transition-all duration-300" />
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            to={link.url}
                            className="text-gray-400 hover:text-fuchsia-400 transition-colors duration-300 flex items-center gap-2 group"
                          >
                            <span className="w-1 h-1 rounded-full bg-fuchsia-500/0 group-hover:bg-fuchsia-500/100 transition-all duration-300" />
                            {link.name}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} NexusAI Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All core systems operational
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}