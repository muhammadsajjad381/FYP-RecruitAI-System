import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Globe, Github, Camera, Save, 
  ArrowLeft, ShieldCheck, Fingerprint, Cpu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import { useEffect } from "react";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { userInfo, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    bio: userInfo?.bio || "",
    github: userInfo?.github || "",
    portfolio: userInfo?.portfolio || "",
    role: userInfo?.role || "Candidate"
  });

  const [profileImage, setProfileImage] = useState(userInfo?.profilePic || null);
  const [imageFile, setImageFile] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync state if userInfo changes
  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        bio: userInfo.bio || "",
        github: userInfo.github || "",
        portfolio: userInfo.portfolio || "",
        role: userInfo.role || "Candidate"
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const uploadData = new FormData();
      Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
      });
      if (imageFile) {
        uploadData.append("profilePic", imageFile);
      }

      const { data } = await apiClient.put("/auth/updatedetails", uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update global context and local storage
      updateUser(data.data);
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Profile update protocol failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- High-End Professional Styles (Color Matched to Home) ---
  const inputStyle = "w-full bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 p-3.5 rounded-[10px] focus:border-green-500 outline-none transition-all text-[13px] text-slate-800 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-600 font-medium shadow-sm dark:shadow-inner";
  const labelStyle = "text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-gray-500 mb-2.5 block ml-0.5";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-800 dark:text-gray-200 font-sans selection:bg-green-500/30 transition-colors duration-500">
      
      {/* Toast Notification (Green Theme) */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-6 py-3 rounded-[10px] flex items-center gap-3 font-bold shadow-lg text-[12px] uppercase tracking-widest"
          >
            <ShieldCheck size={16} /> Identity Synced
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto py-16 px-8">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-slate-200 dark:border-gray-800/50 pb-10">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 dark:text-gray-500 hover:text-green-500 transition-colors mb-6 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[3px]">Back to Home</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
              Edit <span className="text-green-500 not-italic">Profile</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-green-500/5 rounded-full border border-green-500/20">
            <Cpu size={14} className="text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">AI Profile Matching Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Side: Avatar & Bio Summary */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative mb-8 group">
                <div className="w-44 h-44 rounded-[20px] bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 p-1.5 transition-all group-hover:border-green-500/50 shadow-xl">
                  <div className="w-full h-full rounded-[14px] overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-black/40">
                    {profileImage ? (
                      <img 
                        src={profileImage.startsWith('blob:') ? profileImage : `http://localhost:5000${profileImage}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User size={50} className="text-slate-300 dark:text-gray-700" />
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-3 -right-3 p-3.5 bg-green-600 text-white rounded-[15px] shadow-xl hover:bg-green-500 transition-all active:scale-90 border-4 border-[#f8fafc] dark:border-[#00050d]"
                >
                  <Camera size={18} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>
              
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">{formData.name}</h2>
              <p className="text-[11px] text-green-500 font-bold uppercase tracking-[4px] mt-1">{formData.role}</p>
            </div>

            <div className="pt-10 border-t border-slate-200 dark:border-gray-800/50">
                <div className="flex items-start gap-4 p-5 rounded-[20px] bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 dark:border-green-500/10 shadow-sm">
                    <Fingerprint className="text-green-500 mt-0.5" size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white tracking-widest">Neural Link Encryption</p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-500 italic leading-relaxed mt-1">"Your profile data is synchronized across the neural candidate network for 100% accuracy."</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Side: Professional Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-10 bg-white dark:bg-white/[0.01] p-0 md:p-8 rounded-[32px] md:border md:border-slate-100 md:dark:border-white/5 md:shadow-sm">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelStyle}>Full Name</label>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} className={inputStyle} />
                </div>
                <div>
                  <label className={labelStyle}>System Email (Read Only)</label>
                  <input type="email" value={formData.email} className={`${inputStyle} opacity-60 bg-slate-50 dark:bg-transparent cursor-not-allowed italic border-dashed`} readOnly />
                </div>
              </div>

              <div>
                <label className={labelStyle}>Professional Biography</label>
                <textarea 
                  name="bio" 
                  rows="4" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  className={`${inputStyle} resize-none leading-relaxed italic`} 
                  placeholder="Tell us about your tech stack..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelStyle}>GitHub Protocol URL</label>
                  <div className="relative">
                     <Github size={14} className="absolute left-4 top-4 text-slate-400" />
                     <input name="github" type="text" value={formData.github} onChange={handleChange} className={`${inputStyle} pl-12`} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Portfolio Interface</label>
                  <div className="relative">
                     <Globe size={14} className="absolute left-4 top-4 text-slate-400" />
                     <input name="portfolio" type="text" value={formData.portfolio} onChange={handleChange} className={`${inputStyle} pl-12`} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-10 border-t border-slate-200 dark:border-gray-800/50 flex flex-col sm:flex-row items-center gap-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-12 py-4 bg-green-600 text-white font-black rounded-[15px] hover:bg-green-500 transition-all text-[11px] uppercase tracking-[3px] shadow-lg shadow-green-900/20 active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} className="inline-block mr-2" />
                  {loading ? "Syncing Identity..." : "Save Identity"}
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="text-slate-400 dark:text-gray-600 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-[3px] transition-all"
                >
                  Discard Changes
                </button>
              </div>
            </form>
          </div>
        </div>

      
      </main>
    </div>
  );
}