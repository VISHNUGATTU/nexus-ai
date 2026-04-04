import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Cpu, 
  AppWindow, 
  Code2, 
  FileClock, 
  ShieldCheck, 
  Network, 
  MessageSquare, 
  Github,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";

// A reusable sub-component to render sleek terminal/code blocks
const CodeBlock = ({ language, code }) => (
  <div className="my-6 rounded-xl overflow-hidden bg-[#0A0A0F] border border-white/10 shadow-lg">
    <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/5 text-xs text-gray-400 font-mono justify-between">
      <span>{language}</span>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
      </div>
    </div>
    <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

export default function Docs() {
  const [activeSection, setActiveSection] = useState("introduction");
  const location = useLocation();

  // Listen to the URL hash. If someone navigates to /docs#security, open the security tab!
  useEffect(() => {
    if (location.hash) {
      // Remove the '#' symbol from the string
      const sectionId = location.hash.replace("#", "");
      
      // Make sure the section actually exists in our data before setting it
      const validSections = [
        "introduction", "getting-started", "supported-apps", 
        "workflow-scripts", "local-api", "security", "release-notes"
      ];
      
      if (validSections.includes(sectionId)) {
        setActiveSection(sectionId);
      }
    }
  }, [location.hash]); // Re-run this whenever the hash changes
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const discordUrl = import.meta.env.VITE_DISCORD_URL || "https://discord.com/channels/1481234897287909438/1481234898303057926";
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com/your-repo/nexus-ai";

  // Scroll to top of content when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const navigation = [
    { id: "introduction", label: "What is NexusAI?", icon: <Cpu className="w-4 h-4" /> },
    { id: "getting-started", label: "How to Use", icon: <Terminal className="w-4 h-4" /> },
    { id: "supported-apps", label: "Supported Apps", icon: <AppWindow className="w-4 h-4" /> },
    { id: "workflow-scripts", label: "Workflow Scripts", icon: <Code2 className="w-4 h-4" /> },
    { id: "local-api", label: "Local API Access", icon: <Network className="w-4 h-4" /> },
    { id: "security", label: "Security & Privacy", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "release-notes", label: "Release Notes", icon: <FileClock className="w-4 h-4" /> },
  ];

  const content = {
    "introduction": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">What is NexusAI?</h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          NexusAI is a powerful local execution engine bridging the gap between natural language processing and your operating system. Unlike standard LLM chatbots that only return text, NexusAI acts on your behalf.
        </p>
        <h3 className="text-xl font-semibold text-white mt-8 mb-4">The Architecture</h3>
        <p className="text-gray-400 leading-relaxed">
          When you issue a command, the Nexus Core parses your intent into a standardized JSON payload. This payload is then intercepted by local system hooks to physically execute the task on your machine—whether that means opening a browser, managing file directories, or launching a development environment.
        </p>
        <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-200 text-sm mt-6 leading-relaxed">
          <strong>Note:</strong> NexusAI requires the local client daemon to be running in the background to execute terminal and OS-level commands.
        </div>
      </div>
    ),
    "getting-started": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">How to Use</h1>
        <p className="text-gray-400 leading-relaxed">
          Interacting with NexusAI is designed to be frictionless. Once you are authenticated and your local daemon is active, you can begin issuing commands directly into the terminal interface.
        </p>
        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Command Examples</h3>
        <ul className="list-disc list-inside text-gray-400 space-y-3 ml-2">
          <li><span className="text-fuchsia-400 font-mono text-sm">"Open VS Code in my documents folder"</span></li>
          <li><span className="text-fuchsia-400 font-mono text-sm">"Launch YouTube and search for React tutorials"</span></li>
          <li><span className="text-fuchsia-400 font-mono text-sm">"Kill all running Node processes"</span></li>
        </ul>
        <h3 className="text-xl font-semibold text-white mt-8 mb-4">System Feedback</h3>
        <p className="text-gray-400 leading-relaxed">
          NexusAI will always output the exact shell command or API hook it is about to execute, ensuring you have full transparency over what the AI is doing to your local machine.
        </p>
      </div>
    ),
    "supported-apps": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Supported Applications</h1>
        <p className="text-gray-400 leading-relaxed">
          NexusAI hooks into your operating system's native application registry. It currently boasts deep integration with the following software suites:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Web Browsers</h4>
            <p className="text-sm text-gray-400">Chrome, Firefox, Edge, Brave. Supports opening specific URLs, searching, and managing tabs.</p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Development</h4>
            <p className="text-sm text-gray-400">VS Code, IntelliJ, Docker Desktop, Terminal (Zsh/Bash/PowerShell).</p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Communication</h4>
            <p className="text-sm text-gray-400">WhatsApp Desktop, Slack, Discord, Microsoft Teams.</p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Media & Utilities</h4>
            <p className="text-sm text-gray-400">Spotify, File Explorer, System Settings.</p>
          </div>
        </div>
      </div>
    ),
    "workflow-scripts": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Workflow Scripts</h1>
        <p className="text-gray-400 leading-relaxed">
          For power users, typing out long commands every day is inefficient. You can write custom JSON macros that chain multiple actions together under a single trigger phrase.
        </p>
        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Creating a Macro</h3>
        <p className="text-gray-400 leading-relaxed">
          Below is an example of a "Morning Routine" script. When the user types <code>"start my morning"</code>, NexusAI parses this JSON and executes the array of actions sequentially.
        </p>
        
        <CodeBlock 
          language="json (nexus_macros.json)" 
          code={`{
  "trigger": "start my morning",
  "actions": [
    { 
      "app": "chrome", 
      "action": "open_url", 
      "target": "https://mail.google.com" 
    },
    { 
      "app": "vscode", 
      "action": "launch_workspace", 
      "target": "~/projects/nexus-ai" 
    },
    { 
      "app": "terminal", 
      "action": "execute", 
      "target": "npm run dev" 
    }
  ]
}`} 
        />
      </div>
    ),
    "local-api": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Local API Access</h1>
        <p className="text-gray-400 leading-relaxed">
          NexusAI exposes a local REST API on your machine. This allows you to trigger the assistant programmatically from your own Python scripts, Stream Decks, or CI/CD pipelines.
        </p>
        
        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Execution Endpoint</h3>
        <p className="text-gray-400 leading-relaxed">
          Send a POST request to the local daemon to execute a natural language command silently in the background.
        </p>

        <CodeBlock 
          language="bash" 
          code={`curl -X POST http://localhost:5000/api/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_LOCAL_KEY" \\
  -d '{
    "command": "Open Spotify and play my Liked Songs"
  }'`} 
        />
        
        <div className="p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-200 text-sm mt-6 leading-relaxed">
          Your local API key can be generated in the Settings panel of the NexusAI Command Center.
        </div>
      </div>
    ),
    "security": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Security & Privacy</h1>
        <p className="text-gray-400 leading-relaxed">
          Giving an AI access to your local machine requires absolute trust. We built NexusAI with a security-first, zero-retention architecture.
        </p>
        <ul className="list-none space-y-4 mt-6">
          <li className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Local Sandboxing</strong>
              <p className="text-sm text-gray-400">System commands are executed within isolated shell instances. The AI cannot access directories outside of your predefined scope without explicit permission.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Zero Data Retention</strong>
              <p className="text-sm text-gray-400">Your prompts, file names, and API keys are never stored on our external servers. Execution mapping happens locally, and telemetry is strictly opt-in.</p>
            </div>
          </li>
        </ul>
      </div>
    ),
    "release-notes": (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Release Notes</h1>
        <p className="text-gray-400 leading-relaxed mb-8">
          Stay up to date with the latest engine upgrades and feature additions.
        </p>
        
        <div className="border-l-2 border-white/10 pl-6 pb-8 relative">
          <div className="absolute w-3 h-3 bg-fuchsia-500 rounded-full -left-[7px] top-1 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
          <h3 className="text-xl font-bold text-white">v2.0.0-beta <span className="text-sm font-normal text-gray-500 ml-3">Latest</span></h3>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mt-4 text-sm">
            <li>Added sandboxed application execution engine.</li>
            <li>Reduced command-to-action latency to &lt;12ms.</li>
            <li>Introduced multi-step JSON workflow chaining.</li>
            <li>Fixed a bug where Chrome tabs would open in the background.</li>
          </ul>
        </div>

        <div className="border-l-2 border-white/10 pl-6 relative">
          <div className="absolute w-3 h-3 bg-gray-600 rounded-full -left-[7px] top-1"></div>
          <h3 className="text-xl font-bold text-white">v1.5.2 <span className="text-sm font-normal text-gray-500 ml-3">Previous</span></h3>
          <ul className="list-disc list-inside text-gray-400 space-y-2 mt-4 text-sm">
            <li>Initial release of the Local API endpoint.</li>
            <li>Added support for WhatsApp Desktop and Slack.</li>
            <li>Improved NLP parsing for complex nested directories.</li>
          </ul>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-gray-200 font-sans selection:bg-fuchsia-500/30 flex flex-col relative">
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-screen pointer-events-none   z-0" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#05050A]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight z-50">
            <Terminal className="w-5 h-5 text-fuchsia-500" />
            NexusAI <span className="font-normal text-gray-500 hidden sm:inline">Docs</span>
          </Link>
        </div>

        <Link 
          to="/" 
          className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Main Site
        </Link>
      </header>

      <div className="flex flex-1 max-w-[1400px] w-full mx-auto relative z-10">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-white/10 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto py-8 px-6">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Documentation</h4>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id 
                    ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-10 mb-4">Community</h4>
          <nav className="space-y-2">
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-[#5865F2] transition-colors">
              <MessageSquare className="w-4 h-4" /> Join Discord
            </a>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              <Github className="w-4 h-4" /> View GitHub
            </a>
          </nav>
        </aside>

        {/* Mobile Sidebar (Slide out) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0A0A0F] border-r border-white/10 z-50 pt-20 px-6 md:hidden shadow-2xl"
            >
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Documentation</h4>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === item.id 
                        ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" 
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 py-12 px-6 lg:px-16 min-w-0 pb-32">
          {/* Deep glow effect behind the content */}
          <div className="absolute top-20 right-20 w-[600px] h-[400px] bg-violet-900/10 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            {content[activeSection]}
          </div>

          {/* Bottom Pagination / Community CTA */}
          <div className="max-w-3xl mt-20 pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-500">
              Need more help? Our community is available 24/7.
            </p>
            <div className="flex gap-4">
              <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 font-medium text-sm transition-colors border border-[#5865F2]/20">
                <MessageSquare className="w-4 h-4" />
                Discord
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/10">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </main>

      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}