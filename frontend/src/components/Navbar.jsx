import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Mic2,
  Bell,
  User,
  Lock,
  Coins,
  Zap,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import apiClient from "../api/apiClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { userInfo, logout } = useAuth();
  const [hasApplied, setHasApplied] = useState(false);
  const [isInterviewDone, setIsInterviewDone] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isViewAllLogsOpen, setIsViewAllLogsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchStats = async () => {
    if (!userInfo || userInfo.role === 'Admin') return;
    try {
      const { data } = await apiClient.get("/candidate/stats");
      const scoreNum = parseFloat(data.data.accuracy) || 0;
      setMatchScore(scoreNum);
      setHasApplied(data.data.interviewsCompleted > 0 || data.data.status !== 'Under Review');
      setIsInterviewDone(data.data.interviewsCompleted > 0);
    } catch (err) {
      console.error("Failed to fetch nav stats:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      const { data } = await apiClient.get("/notifications");
      setNotifications(data.data);
      setUnreadCount(data.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      fetchNotifications();
      if (link) {
        navigate(link);
        setIsNotificationsOpen(false);
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiClient.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- DYNAMIC NAVIGATION LOGIC ---
  const navLinks = [
    {
      name: "Discover",
      path: "/home",
      icon: <LayoutDashboard size={14} />,
      disabled: false,
    },
    {
      name: "AI Interview",
      path: "/interview",
      icon: <Mic2 size={14} />,
      disabled: !hasApplied,
      tooltip: "Apply for a job first",
    },
    {
      name: "Insights",
      path: "/report",
      icon: <FileText size={14} />,
      disabled: !isInterviewDone,
      tooltip: "Complete interview first",
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled
          ? "py-3 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 shadow-sm"
          : "py-5 bg-white dark:bg-[#00050d] border-b border-slate-200 dark:border-white/5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* BRAND IDENTITY */}
        <div className="flex items-center gap-10 md:gap-16">
          <Link to="/home" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-indigo-600 dark:bg-gradient-to-br dark:from-white dark:to-gray-400 flex items-center justify-center rounded-2xl shadow-xl">
                <Sparkles className="text-white dark:text-black" size={20} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase tracking-widest">
                RECRUIT.AI
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-green-500 tracking-[0.2em] mt-1 uppercase">
                Next-Gen Hiring
              </span>
            </div>
          </Link>

          {/* MAIN NAV WITH STEP LOCKING */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-1 rounded-2xl">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              if (link.disabled) {
                return (
                  <div
                    key={link.name}
                    className="flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/10 cursor-not-allowed group relative"
                  >
                    {link.icon} {link.name}
                    <Lock size={10} className="ml-1 opacity-20" />
                    {/* Hover Tooltip */}
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {link.tooltip}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-white/10 shadow-sm dark:shadow-inner"
                      : "text-slate-400 dark:text-white/40 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {link.icon} {link.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/5"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex flex-col items-end mr-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white/80 font-black text-sm">
              <Zap size={14} className="text-indigo-500 fill-indigo-500/20" />
              <span>
                {Math.round(matchScore)}%{" "}
                <span className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest">
                  Match Score
                </span>
              </span>
            </div>
            <div className="w-20 h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-gradient-to-r dark:from-green-500 dark:to-emerald-400 transition-all duration-1000"
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Profile Dropdown Container */}
          <div
            className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-1.5 rounded-2xl relative"
            ref={dropdownRef}
          >
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#00050d] animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[140%] right-[-60px] md:right-0 w-80 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-[28px] shadow-2xl py-6 z-[200] overflow-hidden"
                  >
                    <div className="px-6 pb-4 mb-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[3px]">Notifications</h4>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Clear All</button>
                      )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto px-2 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-white/10">
                            <Bell size={24} className="text-slate-200 dark:text-white/10" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">Sector Clear</p>
                          <p className="text-[11px] text-slate-300 dark:text-white/20 mt-1 italic">No new protocol updates.</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => markAsRead(notif._id, notif.link)}
                              className={`group p-4 rounded-2xl transition-all cursor-pointer border ${notif.isRead ? 'border-transparent opacity-60' : 'bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 hover:border-indigo-500/30'}`}
                            >
                              <div className="flex gap-4">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-slate-200' : 'bg-indigo-600 animate-pulse'}`} />
                                <div className="space-y-1">
                                  <p className="text-[12px] font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{notif.title}</p>
                                  <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed italic">{notif.message}</p>
                                  <p className="text-[9px] text-slate-300 dark:text-gray-600 font-bold uppercase mt-2">{new Date(notif.createdAt).toLocaleDateString()} • System Alert</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="px-6 pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
                        <button 
                          onClick={() => { setIsViewAllLogsOpen(true); setIsNotificationsOpen(false); }}
                          className="w-full py-3 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                          View All Logs
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/5"></div>

            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-1 group relative outline-none"
            >
              <div className="flex flex-col items-end hidden sm:flex text-right">
                <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
                  {userInfo ? userInfo.name : "Guest User"}
                </span>
                <span className="text-[9px] text-indigo-600 dark:text-green-500 font-black mt-1 uppercase tracking-tighter italic flex items-center gap-1">
                  <Coins size={8} /> 1.2k Credits
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-gray-900 border ${
                  isProfileOpen ? "border-indigo-600 dark:border-green-500" : "border-slate-200 dark:border-white/10"
                } flex items-center justify-center transition overflow-hidden shadow-sm`}
              >
                {userInfo?.profilePic ? (
                  <img 
                    src={`http://localhost:5000${userInfo.profilePic}`} 
                    alt="P" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User
                    size={16}
                    className={isProfileOpen ? "text-indigo-600 dark:text-green-500" : "text-slate-400 dark:text-white/60"}
                  />
                )}
              </div>
            </button>

            {/* UPWORK STYLE DROPDOWN */}
            {isProfileOpen && (
              <div className="absolute top-[125%] right-0 w-64 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-[24px] shadow-2xl py-4 px-2 animate-in fade-in zoom-in duration-200 text-slate-900">
                <div className="px-4 py-3 mb-2 border-b border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                    {userInfo?.role === 'Admin' ? 'Admin Account' : 'Candidate Account'}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{userInfo ? userInfo.name : "Guest"}</p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition text-[13px] font-medium text-left"
                  >
                    <UserCircle size={16} /> Edit Profile
                  </button>
                  <button
                    onClick={() => navigate("/setting")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition text-[13px] font-medium text-left"
                  >
                    <Settings size={16} /> Settings
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 transition text-[13px] font-bold text-left"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE NAV MENU (Animated & Stylized) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#00050d]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 p-6 animate-in slide-in-from-top-4 duration-300 z-50">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              if (link.disabled) {
                return (
                  <div
                    key={link.name}
                    className="flex justify-between items-center px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-300 dark:text-white/20 font-bold uppercase tracking-widest text-[11px]"
                  >
                    <span className="flex items-center gap-3">{link.icon} {link.name}</span>
                    <Lock size={12} className="opacity-30" />
                  </div>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                    active 
                    ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                    : "bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5"
                  }`}
                >
                  {link.icon} {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {/* VIEW ALL LOGS MODAL */}
      <AnimatePresence>
        {isViewAllLogsOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0b111b] w-full max-w-2xl rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl">
                    <FileText size={20} className="text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">System Logs</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Total Records: {notifications.length}</p>
                  </div>
                </div>
                <button onClick={() => setIsViewAllLogsOpen(false)} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-20">
                     <Bell size={40} className="mx-auto text-slate-200 dark:text-white/5 mb-4" />
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No Logs Found</p>
                  </div>
                ) : (
                  notifications.map(log => (
                    <div 
                      key={log._id} 
                      onClick={() => { setSelectedLog(log); if(!log.isRead) markAsRead(log._id); }}
                      className="p-5 border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl cursor-pointer hover:border-indigo-500/30 transition-all group flex items-start justify-between gap-4"
                    >
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                           <div className={`w-2 h-2 rounded-full ${log.isRead ? 'bg-slate-300 dark:bg-white/20' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'}`} />
                           <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{log.title}</p>
                         </div>
                         <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 italic">{log.message}</p>
                       </div>
                       <div className="text-right shrink-0">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleDateString()}</p>
                         <p className="text-[8px] font-black text-indigo-500/60 uppercase tracking-widest mt-1 group-hover:text-indigo-400 transition-colors">View Details</p>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDIVIDUAL LOG MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0b111b] w-full max-w-lg rounded-[32px] shadow-2xl border border-indigo-500/20 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500" />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    <Bell size={12} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Protocol Alert</span>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white p-1 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-4 leading-none">
                  {selectedLog.title}
                </h2>
                
                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-5 rounded-2xl mb-6 shadow-inner">
                  <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed italic">
                    "{selectedLog.message}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Generated: {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                  
                  {selectedLog.link && (
                    <button 
                      onClick={() => {
                        markAsRead(selectedLog._id, selectedLog.link);
                        setSelectedLog(null);
                        setIsViewAllLogsOpen(false);
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                      Execute Directive
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </nav>
  );
}
