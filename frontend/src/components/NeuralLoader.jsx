import React from "react";
import { motion } from "framer-motion";

const NeuralLoader = ({ message = "Processing Neural Data..." }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#000205] flex flex-col items-center justify-center">
      {/* Central Animated Core */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full"
        />
        
        {/* Pulsing Core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-indigo-600 rounded-full blur-2xl opacity-50"
        />
        
        {/* Scanning Line */}
        <motion.div
          animate={{ translateY: [-60, 60, -60] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-40 h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-10"
        />
        
        <div className="relative z-20 font-black text-xs tracking-[0.3em] text-white">
          SCANNING
        </div>
      </div>

      {/* Progress Text */}
      <div className="mt-10 text-center">
        <h3 className="text-indigo-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          {message}
        </h3>
        <p className="text-gray-600 text-[10px] mt-2 font-bold uppercase tracking-widest">
          Do not disconnect from the RecruitLink
        </p>
      </div>
    </div>
  );
};

export default NeuralLoader;