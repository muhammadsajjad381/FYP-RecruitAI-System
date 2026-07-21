import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Lock, Bell, Eye, EyeOff, 
  ArrowLeft, Smartphone, Mail, Trash2, Shield, Fingerprint
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";

export default function UserProfileSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [showToast, setShowToast] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // --- Password States ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Preferences States ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Protocols missing. Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Neural mismatch: Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiClient.put("/auth/updatepassword", { currentPassword, newPassword });
      setShowToast(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Password update protocol failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const inputStyle = "w-full bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 p-3.5 rounded-[10px] focus:border-green-500 outline-none transition-all text-[13px] text-slate-800 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-700 font-medium shadow-sm dark:shadow-inner";
  const labelStyle = "text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-gray-500 mb-2.5 block ml-0.5";
  const sectionTitle = "text-[11px] font-black uppercase tracking-[4px] text-green-500 mb-8 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-800 dark:text-gray-200 font-sans selection:bg-green-500/30 transition-colors duration-500">
      
      {/* Success Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-6 py-3 rounded-[10px] flex items-center gap-3 font-bold shadow-lg text-[11px] uppercase tracking-widest"
          >
            <ShieldCheck size={16} /> Identity Protocols Updated
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto py-16 px-8">
        
        {/* Navigation Header */}
        <div className="mb-16 border-b border-slate-200 dark:border-gray-800/50 pb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 dark:text-gray-500 hover:text-green-500 transition-colors mb-6 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[3px]">Return to Profile</span>
          </button>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
            Account <span className="text-green-500 not-italic">Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-600 mt-2 font-medium uppercase tracking-widest italic opacity-60">Manage your security and privacy nodes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Controls */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* 1. Security Section */}
            <section className="bg-white dark:bg-white/[0.01] p-8 rounded-[32px] md:border md:border-slate-100 md:dark:border-white/5 md:shadow-sm">
              <h3 className={sectionTitle}><Lock size={14}/> Security Matrix</h3>
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-[10px]">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Current Password</label>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"} 
                      placeholder="••••••••" 
                      className={inputStyle}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-slate-400 dark:text-gray-600 hover:text-green-500 transition-colors">
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>New Password</label>
                    <div className="relative">
                      <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="••••••••" 
                        className={inputStyle}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-slate-400 dark:text-gray-600 hover:text-green-500 transition-colors">
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="••••••••" 
                        className={inputStyle}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3.5 text-slate-400 dark:text-gray-600 hover:text-green-500 transition-colors">
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Communication & Privacy Toggles */}
            <section className="pt-10 border-t border-slate-200 dark:border-gray-800/50">
              <h3 className={sectionTitle}><Bell size={14}/> Communication & Privacy</h3>
              <div className="space-y-4">
                
                {/* Email Alerts Toggle */}
                <div className="flex items-center justify-between p-5 bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 rounded-[15px] group hover:border-green-500/30 transition-all shadow-sm">
                   <div className="flex gap-4">
                      <div className="p-3 bg-green-500/10 dark:bg-green-500/5 rounded-[12px] text-green-500"><Mail size={18}/></div>
                      <div>
                        <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Email Notifications</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-600 uppercase mt-1">Receive job matches and interview invites.</p>
                      </div>
                   </div>
                   <button onClick={() => setEmailAlerts(!emailAlerts)} className={`w-11 h-5 rounded-full transition-all relative ${emailAlerts ? 'bg-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-slate-200 dark:bg-gray-800'}`}>
                     <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${emailAlerts ? 'left-6' : 'left-0.5'}`} />
                   </button>
                </div>

                {/* Profile Visibility Toggle */}
                <div className="flex items-center justify-between p-5 bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 rounded-[15px] group hover:border-green-500/30 transition-all shadow-sm">
                   <div className="flex gap-4">
                      <div className="p-3 bg-green-500/10 dark:bg-green-500/5 rounded-[12px] text-green-500"><Shield size={18}/></div>
                      <div>
                        <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Profile Discovery</p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-600 uppercase mt-1">Allow verified recruiters to find your profile.</p>
                      </div>
                   </div>
                   <button onClick={() => setProfilePublic(!profilePublic)} className={`w-11 h-5 rounded-full transition-all relative ${profilePublic ? 'bg-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-slate-200 dark:bg-gray-800'}`}>
                     <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${profilePublic ? 'left-6' : 'left-0.5'}`} />
                   </button>
                </div>

              </div>
            </section>

            {/* Save Buttons */}
            <div className="pt-10 border-t border-slate-200 dark:border-gray-800/50 flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={handleUpdate} 
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-4 bg-green-600 text-white font-black rounded-[15px] hover:bg-green-500 transition-all text-[11px] uppercase tracking-[3px] shadow-lg shadow-green-900/20 active:scale-95 disabled:opacity-50"
                >
                    {loading ? "Re-encrypting..." : "Save Configuration"}
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 dark:text-gray-600 hover:text-green-500 text-[10px] font-black uppercase tracking-[3px] transition-all"
                >
                    Logout System
                </button>
            </div>
          </div>

          {/* Sidebar Info Panels */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 dark:border-green-500/10 rounded-[20px] shadow-sm">
                <Fingerprint className="text-green-500 mb-4" size={24} />
                <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2">Neural Security</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-500 italic leading-relaxed mb-6">"Enhance your candidate profile security by enabling two-factor authentication."</p>
                <button 
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`w-full py-3 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all ${twoFactor ? 'bg-green-600 text-white shadow-md shadow-green-900/30' : 'border border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-gray-600'}`}
                >
                    {twoFactor ? '2FA Active' : 'Activate 2FA'}
                </button>
            </div>

            <div className="p-8 border border-red-200 dark:border-red-900/20 bg-red-50 dark:bg-red-950/5 rounded-[20px] group shadow-sm">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 italic">Danger Zone</p>
                <button className="w-full flex items-center justify-center gap-3 py-3 rounded-[12px] text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-200 dark:border-red-900/30 hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 size={14} /> Terminate Account
                </button>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
}