import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle, Cpu, Target, 
  UploadCloud, ArrowRight, ShieldCheck 
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";

export default function UploadPage() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const { userInfo } = useAuth();
  const jobId = location.state?.jobId;

  const [aiResult, setAiResult] = useState({ score: 0, skills: [] });

  const handleCardClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setIsAnalyzing(true);
      setError("");

      const formData = new FormData();
      formData.append("resume", file);
      if (jobId) formData.append("jobId", jobId);

      try {
        const { data } = await apiClient.post("/candidate/upload-resume", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        setAiResult({
          score: data.data.matchScore,
          skills: data.data.identifiedSkills
        });

        // If we came from a specific job, apply for it immediately after upload
        if (jobId) {
          await apiClient.post(`/jobs/${jobId}/apply`, {
            aiScore: data.data.matchScore,
            aiFeedback: `High synergy with core requirements: ${data.data.identifiedSkills.join(', ')}`,
            resumeUrl: data.data.resumeUrl,
          });
        }
        
        setIsUploaded(true);
      } catch (err) {
        setError(err.response?.data?.message || "Analysis failed. Neural link timeout.");
        setIsUploaded(false);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-500 dark:text-zinc-400 p-8 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER SECTION - Cleaned up Uppercase */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            Neural Screening Phase 01
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mt-2">
            CV Analysis & <span className="text-emerald-500 italic">Screening</span>
          </h1>
          <p className="text-slate-400 dark:text-zinc-500 mt-1 text-base font-medium opacity-80">
            AI-powered resume evaluation for neural professional footprints.
          </p>
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl inline-block">
              {error}
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.doc,.docx" 
        />

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={handleCardClick} 
            className={`h-[200px] flex flex-col items-center justify-center p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer group shadow-sm dark:shadow-none ${
              isUploaded ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0b111b]/50 hover:border-emerald-500/40'
            }`}
          >
            <div className={`w-20 h-30 rounded-3xl flex items-center justify-center mb-6 transition-all ${isUploaded ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 group-hover:text-emerald-500'}`}>
              {isUploaded ? <CheckCircle size={36} /> : <UploadCloud size={36} />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {isUploaded ? "CV Captured" : "Upload Resume"}
            </h3>
            <p className="text-sm text-slate-400 dark:text-zinc-500 text-center px-4">
              {isUploaded ? fileName : "Select your PDF or DOCX file to begin"}
            </p>
          </motion.div>

          
          <div className={`h-[200px] flex flex-col items-center justify-center p-10 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0b111b]/50 transition-all relative overflow-hidden shadow-sm dark:shadow-none ${isAnalyzing || isUploaded ? 'opacity-100 border-emerald-500/20' : 'opacity-30'}`}>
            {isAnalyzing && (
              <motion.div 
                initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              />
            )}
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-zinc-900 ${isAnalyzing ? 'text-emerald-500 animate-pulse' : 'text-slate-400 dark:text-zinc-600'}`}>
              <Cpu size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Analyzing</h3>
            <p className="text-sm text-slate-400 dark:text-zinc-500 text-center px-4">
              {isAnalyzing ? "Extracting professional skills..." : "Waiting for document upload"}
            </p>
          </div>

     
          <div className={`h-[200px] flex flex-col items-center justify-center p-10 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0b111b]/50 transition-all shadow-sm dark:shadow-none ${isUploaded ? 'opacity-100 border-emerald-500/30' : 'opacity-30'}`}>
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-zinc-900 ${isUploaded ? 'text-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)]' : 'text-slate-400 dark:text-zinc-600'}`}>
              <Target size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Match Score</h3>
            <p className={`text-sm font-semibold ${isUploaded ? 'text-emerald-500' : 'text-slate-400 dark:text-zinc-500'} text-center px-4`}>
              {isUploaded ? `${aiResult.score}% Synergy Found` : "Analyzing candidate fit"}
            </p>
          </div>
        </div>

        
        <AnimatePresence>
          {isUploaded && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0b111b]/80 border border-slate-200 dark:border-zinc-800 p-10 rounded-[32px] backdrop-blur-xl shadow-xl dark:shadow-2xl"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <ShieldCheck className="text-emerald-500" size={24} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Neural Analysis Report</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 font-bold">Source File</p>
                      <p className="text-sm text-slate-600 dark:text-zinc-200 truncate pr-4">{fileName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 font-bold">Identified Skills</p>
                      <p className="text-sm text-emerald-500/90 font-black uppercase tracking-tight">
                        {aiResult.skills.length > 0 ? aiResult.skills.join(', ') : "GENERAL LOGIC"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 font-bold">System Status</p>
                      <p className={`text-sm font-black uppercase tracking-tight ${aiResult.score > 50 ? 'text-indigo-500' : 'text-yellow-500'}`}>
                        {aiResult.score > 50 ? 'AWAITING HR REVIEW' : 'PENDING'}
                      </p>
                    </div>
                  </div>
                </div>

                  <button 
                    onClick={() => navigate("/home")}
                    className="group bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold text-sm tracking-wide flex items-center gap-3 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 shrink-0"
                  >
                    Return to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      
      </div>
    </div>
  );
}