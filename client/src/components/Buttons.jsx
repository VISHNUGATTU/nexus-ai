import React from "react";

export const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const GhostButton = ({ children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-md active:scale-95 transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);