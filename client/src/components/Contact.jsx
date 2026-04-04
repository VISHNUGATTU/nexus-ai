import { Mail, MessageSquare, Briefcase, ArrowUpRight } from "lucide-react";
import Title from "./Title";
import { motion } from "framer-motion";

export default function Contact() {
  // Pulling Discord URL from the .env file. Fallback is provided just in case.
  const discordUrl = import.meta.env.VITE_DISCORD_URL || "https://discord.com/channels/1481234897287909438/1481234898303057926";

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-fuchsia-400" />,
      title: "Technical Support",
      description: "Need help configuring local application hooks or debugging custom execution workflows?",
      detail: "gattuvishnuphani@gmail.com",
      link: "mailto:gattuvishnuphani@gmail.com",
      actionText: "Email Support",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-violet-400" />,
      title: "Enterprise Sales",
      description: "Looking to deploy secure, locally-integrated automation models across your organization's infrastructure?",
      detail: "23071a6788@vnrvjiet.in",
      link: "mailto:23071a6788@vnrvjiet.in",
      actionText: "Contact Sales",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      title: "Power User Community",
      description: "Join the server of developers and power users sharing custom automation scripts in our Discord.",
      detail: "Live 24/7",
      link: discordUrl, 
      actionText: "Join Discord",
      target: "_blank" // Added to open Discord in a new tab
    },
  ];

  return (
    <section id="contact" className="py-24 relative overflow-hidden z-10">
      {/* Subtle ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] bg-violet-900/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Title
          title="Contact"
          heading="System Support & Inquiries"
          description="Whether you're troubleshooting a local automation workflow, building custom system scripts, or deploying across an enterprise environment, our team is ready to assist."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 50,
                delay: 0.1 + i * 0.1,
              }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 transition-all duration-500"
            >
              {/* Inner glow on hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 relative z-10">
                {method.icon}
              </div>

              <h3 className="text-xl font-semibold mb-3 text-white relative z-10">
                {method.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed mb-8 relative z-10 flex-grow">
                {method.description}
              </p>

              <div className="pt-6 border-t border-white/10 relative z-10 mt-auto flex items-center justify-between">
                {/* Truncated the email display so it doesn't break the layout on small screens */}
                <span className="text-sm font-medium text-gray-300 truncate max-w-[140px] md:max-w-[160px]" title={method.detail}>
                  {method.detail}
                </span>
                
                <a
                  href={method.link}
                  target={method.target || "_self"}
                  rel={method.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors group/link shrink-0"
                >
                  {method.actionText}
                  <ArrowUpRight className="w-4 h-4 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support Status Banner */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 50, delay: 0.5 }}
          className="mt-12 mx-auto max-w-2xl rounded-full bg-white/5 border border-white/10 backdrop-blur-md px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
        >
          <div className="flex items-center gap-3 text-gray-300">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Average support response time:
          </div>
          <div className="font-semibold text-white">
            Under 2 hours
          </div>
        </motion.div>

      </div>
    </section>
  );
}