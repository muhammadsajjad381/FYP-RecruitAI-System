import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  Briefcase,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userInfo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper function to check if route is active
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Jobs", path: "/admin/jobs", icon: <Briefcase size={20} /> },
    { name: "Candidates", path: "/admin/candidates", icon: <Users size={20} /> },
    { name: "Question Bank", path: "/admin/questions", icon: <Database size={20} /> },
    { name: "Neural Reports", path: "/admin/reports", icon: <FileText size={20} /> },
  ];

  return (
    <div className ="flex h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-600 dark:text-gray-400 overflow-hidden font-sans">
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- SMART COLLAPSIBLE SIDEBAR --- */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#050a10] border-r border-slate-200 dark:border-white/5 transition-all duration-300 ease-in-out flex flex-col overflow-hidden shadow-2xl ${
          isHovered || isMobileOpen ? "w-[260px]" : "w-[70px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-5 border-b border-slate-100 dark:border-white/5 shrink-0 justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-600 dark:bg-green-500 p-2 rounded-lg min-w-[32px] shadow-lg shadow-indigo-500/20 dark:shadow-none">
              <Sparkles size={16} className="text-white dark:text-black" />
            </div>
            <span
              className={`ml-4 text-slate-900 dark:text-white font-black italic tracking-tighter transition-opacity duration-300 whitespace-nowrap text-lg ${
                isHovered || isMobileOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              RECRUIT.AI
            </span>
          </div>
          {isMobileOpen && (
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center h-12 rounded-xl transition-all group relative ${
                isActive(item.path)
                  ? "bg-indigo-600 dark:bg-green-500 text-white dark:text-black shadow-lg shadow-indigo-500/30 dark:shadow-green-500/20 font-black"
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="min-w-[46px] flex justify-center">
                {item.icon}
              </div>
              <span
                className={`ml-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                  isHovered || isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
              >
                {item.name}
              </span>
              
              {/* Active Glow Dot */}
              {isActive(item.path) && !isHovered && (
                <div className="absolute right-2 w-1 h-1 bg-black rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-white/5 space-y-1 shrink-0 bg-white dark:bg-[#050a10]">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={() => toggleTheme()} 
            className="flex items-center h-12 w-full rounded-xl transition-all group relative hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          >
            <div className="min-w-[46px] flex justify-center">
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-500 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon size={20} fill="currentColor" className="text-slate-400" />
              )}
            </div>
            <span
              className={`ml-2 text-[10px] font-black tracking-[2px] uppercase transition-all duration-300 ${
                isHovered || isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              {theme === 'dark' ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Settings Button - Updated with Active State */}
          <button 
            onClick={() => navigate("/admin/settings")} 
            className={`flex items-center h-12 w-full rounded-xl transition-all group relative ${
              isActive("/admin/settings")
                ? "bg-indigo-600 dark:bg-green-500 text-white dark:text-black shadow-lg shadow-indigo-500/30 dark:shadow-green-500/20 font-black"
                : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div className="min-w-[46px] flex justify-center">
              <Settings 
                size={20} 
                className={`transition-transform duration-500 ${isHovered && "group-hover:rotate-90"}`} 
              />
            </div>
            <span
              className={`ml-2 text-[10px] font-black tracking-[2px] uppercase transition-all duration-300 ${
                isHovered || isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              Settings
            </span>
          </button>

          {/* Logout Button */}
          <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center h-12 w-full rounded-xl hover:bg-red-500/5 dark:hover:bg-red-500/10 text-red-600 dark:text-red-500 transition-all group">
            <div className="min-w-[46px] flex justify-center">
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span
              className={`ml-2 text-[10px] font-black tracking-[2px] uppercase transition-all duration-300 ${
                isHovered || isMobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out pl-0 ${
          isHovered ? "md:pl-[260px]" : "md:pl-[70px]"
        }`}
      >
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 md:px-8 bg-white/80 dark:bg-[#00050d]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)] dark:shadow-[0_0_8px_#22c55e]" />
            <span className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.4em] italic truncate font-sans">
              Neural Network Console
            </span>
          </div>
          
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block text-slate-900 dark:text-white">
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none">{userInfo?.name || "Admin Root"}</p>
                 <p className="text-[9px] font-bold text-indigo-600 dark:text-green-500 uppercase mt-1">System Online</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-green-500/10 border border-indigo-100 dark:border-green-500/20 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-green-500 shadow-inner uppercase overflow-hidden">
                {userInfo?.profilePic ? (
                   <img 
                    src={`http://localhost:5000${userInfo.profilePic}`} 
                    alt="P" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  userInfo?.name ? userInfo.name.substring(0, 2) : "AD"
                )}
              </div>
            </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] dark:bg-[#00050d]">
          <div className="p-0">
            <div className="max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}