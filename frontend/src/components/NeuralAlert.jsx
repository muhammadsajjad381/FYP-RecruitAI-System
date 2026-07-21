import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, ShieldAlert } from "lucide-react";

const NeuralAlert = ({ isOpen, type, title, message, onClose }) => {
  const themes = {
    warning: { icon: <AlertTriangle className="text-yellow-500" size={32} />, border: "border-yellow-500/20", bg: "bg-yellow-500/5", glow: "shadow-yellow-500/10" },
    success: { icon: <CheckCircle2 className="text-emerald-500" size={32} />, border: "border-emerald-500/20", bg: "bg-emerald-500/5", glow: "shadow-emerald-500/10" },
    error: { icon: <X className="text-red-500" size={32} />, border: "border-red-500/20", bg: "bg-red-500/5", glow: "shadow-red-500/10" },
    info: { icon: <Info className="text-blue-500" size={32} />, border: "border-blue-500/20", bg: "bg-blue-500/5", glow: "shadow-blue-500/10" }
  };

  const active = themes[type] || themes.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md ${active.bg} ${active.border} ${active.glow} border backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl overflow-hidden text-center`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-[80px] ${type === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>

            <div className="flex flex-col items-center space-y-6">
              <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                {active.icon}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/10 transition-all active:scale-95 border-b-2 border-b-white/20"
              >
                Acknowledge Protocol
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NeuralAlert;