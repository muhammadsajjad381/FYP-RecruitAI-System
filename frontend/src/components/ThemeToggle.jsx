import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`relative flex items-center justify-center p-2 rounded-xl transition-colors ${
        theme === 'dark' 
        ? 'bg-white/5 border border-white/10 text-yellow-400' 
        : 'bg-slate-100 border border-slate-200 text-slate-800'
      } ${className}`}
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === 'dark' ? (
        <Sun size={20} strokeWidth={2.5} className="animate-[spin_10s_linear_infinite]" />
      ) : (
        <Moon size={20} strokeWidth={2.5} fill="currentColor" />
      )}
    </motion.button>
  );
}
