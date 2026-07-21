import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cpu, Activity, ShieldCheck, Database, Zap } from "lucide-react";

export default function AIProcessingScreen({ onComplete }) {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState(0);

  // AI Steps jo screen par bari bari ayenge
  const steps = [
    "Initializing Neural Analysis...",
    "Evaluating Communication Matrix...",
    "Scanning Technical Competency...",
    "Synchronizing Data with Core Server...",
    "Finalizing Performance Report..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    const timeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate("/report");
      }
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, onComplete]);

  return (
    <div className="fixed inset-0 z-[999] bg-[#00050d] flex flex-col items-center justify-center p-6 text-center">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/10 blur-[120px] rounded-full animate-pulse" />

      {/* Main AI Core Animation */}
      <div className="relative mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-2 border-dashed border-green-500/30 rounded-full flex items-center justify-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
          >
            <Cpu className="text-green-500" size={32} />
          </motion.div>
        </motion.div>

        {/* Orbiting Particles */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
        </motion.div>
      </div>

      {/* Text & Progress */}
      <div className="relative z-10 max-w-md w-full">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2">
          AI <span className="text-green-500">Neural Synthesis</span>
        </h2>
        
        <div className="h-1 w-full bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6 }}
            className="h-full bg-green-500 shadow-[0_0_15px_#22c55e]"
          />
        </div>

        {/* Dynamic Status Messages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={loadingStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-3 text-gray-500"
          >
            <Activity size={14} className="text-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[3px] italic">
              {steps[loadingStep]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      
    </div>
  );
}