import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Terminal, Cpu, CheckCircle2, 
  Clock, XCircle, ChevronRight, Sparkles 
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const UserChatAgent = () => {
  const { backendUrl, userInfo } = useAppContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chatId = searchParams.get("chat");

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);
  const [loadingCommand, setLoadingCommand] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // --- UI HELPERS ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeCommand?.messages, isProcessing]);

  // Auto-resize the textarea based on content
  const handleInput = (e) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const extractHistoryArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.commands && Array.isArray(data.commands)) return data.commands;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return []; 
  };

  // --- 1. FETCH ACTIVE CHAT THREAD ---
  useEffect(() => {
    const fetchCommand = async () => {
      if (!chatId) {
        setActiveCommand(null);
        return;
      }

      try {
        setLoadingCommand(true);
        const res = await axios.get(`${backendUrl}/api/commands/history`, { 
          withCredentials: true 
        });
        
        const historyData = extractHistoryArray(res.data);
        const foundChat = historyData.find(chat => chat._id === chatId);
        
        if (foundChat) {
          setActiveCommand(foundChat);
        } else {
          toast.error("Chat session not found.");
          navigate("/user/dashboard");
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        toast.error("Failed to sync with database.");
      } finally {
        setLoadingCommand(false);
      }
    };

    fetchCommand();
  }, [chatId, backendUrl, navigate]);

  // --- 2. SMART AUTO-POLLING LOOP ---
  useEffect(() => {
    let pollInterval;
    let pollCount = 0;
    const MAX_POLLS = 30; // 60 seconds max timeout

    const lastMessage = activeCommand?.messages?.[activeCommand.messages.length - 1];
    const isPending = lastMessage?.status === "pending" || lastMessage?.status === "processing";

    if (isPending) {
      pollInterval = setInterval(async () => {
        pollCount++;
        
        if (pollCount >= MAX_POLLS) {
          clearInterval(pollInterval);
          toast.error("Execution timed out. Python Engine may be offline.");
          
          setActiveCommand(prev => {
            if (!prev) return prev;
            const newMessages = [...prev.messages];
            newMessages[newMessages.length - 1].status = "failed";
            newMessages[newMessages.length - 1].errorMessage = "System timeout. Engine unreachable.";
            return { ...prev, messages: newMessages };
          });
          return;
        }

        try {
          const res = await axios.get(`${backendUrl}/api/commands/history`, { withCredentials: true });
          const historyData = extractHistoryArray(res.data);
          const updatedChat = historyData.find(chat => chat._id === chatId);

          if (updatedChat) {
            setActiveCommand(updatedChat);
            
            const freshLastMsg = updatedChat.messages[updatedChat.messages.length - 1];
            if (freshLastMsg.status === "completed" || freshLastMsg.status === "failed") {
              clearInterval(pollInterval);
              if (freshLastMsg.status === "completed") toast.success("Execution Complete");
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000); 
    }

    return () => clearInterval(pollInterval);
  }, [activeCommand?.messages, chatId, backendUrl]); 

  // --- 3. SUBMIT NEW COMMAND ---
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userPrompt = inputText.trim();
    setInputText("");
    
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    
    setIsProcessing(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/commands`, 
        { 
          prompt: userPrompt,
          chatId: chatId 
        },
        { withCredentials: true }
      );

      if (res.data.success && res.data.chatId) {
        if (chatId !== res.data.chatId) {
          navigate(`/user/dashboard?chat=${res.data.chatId}`);
        } else {
          const historyRes = await axios.get(`${backendUrl}/api/commands/history`, { withCredentials: true });
          const historyData = extractHistoryArray(historyRes.data);
          const updatedChat = historyData.find(chat => chat._id === chatId);
          if (updatedChat) setActiveCommand(updatedChat);
        }
      } else {
        toast.error(res.data.message || "Execution dispatch failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("System error. Node.js backend unreachable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- RENDER HELPERS ---
  const renderStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />;
      case "failed": return <XCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />;
      case "processing": 
      case "pending":
      default: return <Clock className="w-5 h-5 text-fuchsia-400 animate-pulse" />;
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10 font-sans">
      
      {/* CHAT DISPLAY AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-40 pt-6 px-4 md:px-8">
        
        <AnimatePresence mode="wait">
          
          {/* EMPTY STATE */}
          {!chatId && !loadingCommand && !isProcessing && (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center"
            >
              <div className="w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
                <div className="absolute inset-0 bg-fuchsia-500/20 blur-2xl rounded-full animate-pulse" />
                <Terminal className="w-12 h-12 text-fuchsia-400 relative z-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Nexus Engine <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Online</span>
              </h2>
              <p className="text-gray-400 mb-10 max-w-md text-lg leading-relaxed">
                Welcome back, {userInfo?.username || "Commander"}. Enter a directive to manipulate the OS, scrape the web, or automate tasks.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {["Check my system vitals", "What is the latest AI news?", "Mute my system volume", "Read my clipboard data"].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setInputText(suggestion);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    className="px-5 py-4 rounded-xl bg-[#12121A]/50 border border-white/5 text-sm text-gray-300 hover:text-fuchsia-300 hover:bg-white/10 hover:border-fuchsia-500/30 text-left transition-all duration-300 shadow-lg"
                  >
                    <span className="text-fuchsia-500 font-mono mr-2">{">"}</span> {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {loadingCommand && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-10 h-10 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin mb-6"></div>
              <p className="font-mono text-sm uppercase tracking-widest text-fuchsia-500/80">Syncing Telemetry...</p>
            </motion.div>
          )}

          {/* ACTIVE CHAT DISPLAY */}
          {activeCommand && !loadingCommand && (
            <div className="max-w-4xl mx-auto space-y-12 pb-10">
              {activeCommand.messages?.map((msg, index) => (
                <motion.div 
                  key={msg._id || index}
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  
                  {/* User Prompt */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-fuchsia-500/20 text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-[0_0_30px_rgba(168,85,247,0.1)] backdrop-blur-md">
                      <p className="text-[16px] leading-relaxed">{msg.prompt}</p>
                    </div>
                  </div>

                  {/* System Execution Terminal */}
                  <div className="flex justify-start">
                    <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-[90%] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                      
                      {/* HEADER */}
                      <div className="bg-white/5 border-b border-white/5 px-5 py-3 flex items-center justify-between backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                          <Cpu className={`w-5 h-5 ${msg.status === 'completed' ? 'text-green-400' : 'text-fuchsia-400'}`} />
                          <span className="text-xs font-mono tracking-widest text-gray-300 uppercase">Nexus Core Logic</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/5">
                          <span className={`text-[11px] font-mono uppercase tracking-wider ${msg.status === 'completed' ? 'text-green-400' : msg.status === 'failed' ? 'text-red-400' : 'text-fuchsia-400'}`}>
                            {msg.status}
                          </span>
                          {renderStatusIcon(msg.status)}
                        </div>
                      </div>

                      {/* BODY (Removed the action/target block completely) */}
                      <div className="p-6 font-mono text-sm space-y-6">
                        
                        <div className="flex gap-4 items-start">
                          <ChevronRight className="w-5 h-5 text-fuchsia-500 shrink-0 mt-0.5" />
                          <div className={`leading-relaxed text-[15px] whitespace-pre-wrap ${msg.status === 'pending' || msg.status === 'processing' ? 'text-gray-500 animate-pulse' : 'text-gray-100'}`}>
                            {msg.aiResponse}
                          </div>
                        </div>

                        {msg.status === "failed" && msg.errorMessage && (
                          <div className="mt-4 p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3">
                            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{msg.errorMessage}</span>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* FIXED INPUT AREA */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent pt-12 pb-8 px-4 md:px-8 z-20">
        
        <AnimatePresence>
          {isProcessing && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
               className="flex items-center gap-3 text-fuchsia-400 max-w-4xl mx-auto mb-4 px-4 font-mono text-sm tracking-widest uppercase"
             >
               <div className="w-4 h-4 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin"></div>
               Establishing uplink to local engine...
             </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative flex items-end gap-3 bg-[#12121A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-[0_10px_50px_rgba(0,0,0,0.5)] focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all duration-300"
        >
          <div className="p-3 text-fuchsia-500/50">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Initialize execution sequence... (Shift+Enter for new line)"
            className="w-full max-h-[150px] min-h-[44px] bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none resize-none py-3 text-[16px] custom-scrollbar leading-relaxed"
            rows="1"
            disabled={isProcessing}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-3.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-fuchsia-600 hover:shadow-[0_0_20px_rgba(192,38,211,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 mr-0.5 flex items-center justify-center"
          >
            {isProcessing ? (
               <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            ) : (
               <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
            )}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-[11px] text-gray-500 font-mono tracking-widest uppercase">
            Nexus AI operates with local system privileges. Verify critical commands.
          </p>
        </div>
      </div>

    </div>
  );
};

export default UserChatAgent;