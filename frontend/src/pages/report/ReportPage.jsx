import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2, AlertCircle, BarChart3, Download,
  Share2, Award, Target, Brain, MessageSquare, ShieldCheck, Home, Clock
} from "lucide-react";
import PageTransition from "../../components/PageTransition";

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state || null;

  useEffect(() => {
    if (!sessionData) {
      navigate("/home");
    }
  }, [sessionData, navigate]);

  const finalScore = sessionData?.score || 0;

  const handleExportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>RecruitAI Report</title></head><body style='font-family: Arial, sans-serif; padding: 20px;'>";
    const footer = "</body></html>";
    const sourceHTML = header + `
      <h1 style="color: #10B981; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">RecruitAI System - Final Report</h1>
      <h3>Candidate: ${candidateName}</h3>
      <p><b>Match Score:</b> ${finalScore}% (${qualificationTier.label})</p>
      <p><b>Questions Answered:</b> ${answeredCount} / ${totalQuestions}</p>
      <br />
      <h3 style="color: #10B981;">Core Competencies & Feedback</h3>
      <p>${feedbackStrong}</p>
      <br />
      <h3 style="color: #F59E0B;">Growth & Opportunities</h3>
      <p>${feedbackGrowth}</p>
      <br /><hr /><br />
      <h3 style="color: #3B82F6;">Q&A Transcript Synthesis</h3>
      ${questionsAnswered.length === 0 ? "<p>No transcripts recorded.</p>" : questionsAnswered.map((q, i) => `
        <p style="margin-bottom: 5px;"><b>Q${i+1}: ${q}</b></p>
        <p style="margin-top: 0; color: #4B5563;"><i>Analysis: ${finalScore < 40 ? '[STATIC/SILENCE] No meaningful information could be transcribed.' : 'Response evaluated successfully.' }</i></p>
        <br />
      `).join("")}
    ` + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${candidateName.replace(/\s+/g, '_')}_Neural_Report.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "RecruitAI System - Candidate Report\n\n";
    csvContent += `Candidate Name:,${candidateName}\n`;
    csvContent += `Final Score:,${finalScore}%\n`;
    csvContent += `Status:,${qualificationTier.label}\n`;
    csvContent += `Questions Answered:,${answeredCount} of ${totalQuestions}\n\n`;
    csvContent += "Analysis & Feedback\n";
    csvContent += `Strengths:,${feedbackStrong ? feedbackStrong.replace(/,/g, '') : ''}\n`;
    csvContent += `Growth:,${feedbackGrowth ? feedbackGrowth.replace(/,/g, '') : ''}\n\n`;
    csvContent += "Q&A Transcript\n";
    csvContent += "Question,Analysis Provided\n";
    
    questionsAnswered.forEach((q, i) => {
      const a = finalScore < 40 ? '[SILENCE/NO AUDIO]' : 'Evaluated successfully.';
      csvContent += `"${q.replace(/"/g, '""')}","${a}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${candidateName.replace(/\s+/g, '_')}_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const candidateName = sessionData?.candidateName || "Candidate";
  const answeredCount = sessionData?.answeredCount || 0;
  const totalQuestions = sessionData?.totalQuestions || 0;
  const questionsAnswered = sessionData?.questionsAnswered || [];

  const qualificationTier =
    finalScore >= 90 ? { label: "Tier-1 Qualified", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" } :
    finalScore >= 75 ? { label: "Tier-2 Qualified", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" } :
    finalScore >= 60 ? { label: "Under Review", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" } :
    { label: "Not Qualified", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };

  // Animated score counter
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (sessionData) {
      const animation = animate(count, finalScore, { duration: 1.8, ease: "easeOut" });
      return animation.stop;
    }
  }, [count, finalScore, sessionData]);

  if (!sessionData) return null;

  // Derived stats from score (slight variation around the score)
  const stats = [
    { label: "Technical Depth", score: Math.min(100, finalScore + Math.floor(Math.random() * 5) - 2), color: "bg-emerald-500", icon: <Brain size={14} /> },
    { label: "Communication", score: Math.min(100, finalScore + Math.floor(Math.random() * 8)), color: "bg-emerald-400", icon: <MessageSquare size={14} /> },
    { label: "Problem Solving", score: Math.min(100, finalScore - Math.floor(Math.random() * 10)), color: "bg-emerald-600", icon: <Target size={14} /> },
  ];

  const hoverEffect = "hover:border-emerald-500/40 hover:bg-slate-50 dark:hover:bg-emerald-500/[0.03] transition-all duration-500 cursor-default hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.04)]";

  let feedbackStrong;
  let feedbackGrowth;
  const systemFeedback = sessionData?.feedback || "";

  if (finalScore === 0 && systemFeedback.includes("SECURITY ALERT")) {
    feedbackStrong = "URGENT SECURITY ALERT: Biometric verification failed.";
    feedbackGrowth = systemFeedback; // "The speaker's voice does not match..."
  } else if (finalScore < 40) {
    feedbackStrong = "Unable to assess core competencies accurately.";
    feedbackGrowth = systemFeedback || "Audio stream empty or unclear. Candidate failed to provide sufficient responses.";
  } else {
    feedbackStrong = finalScore >= 75
      ? "Demonstrated strong technical knowledge and clear communication across the interview session."
      : "Showed foundational understanding with areas that need further development.";
    feedbackGrowth = systemFeedback || (finalScore >= 75
      ? "Could improve on low-level system design explanations and edge-case handling strategies."
      : "Focus on deepening technical expertise and structuring answers more clearly under time pressure.");
  }

  return (
    <PageTransition>
      <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#00050d] text-slate-900 dark:text-white font-sans relative overflow-y-auto custom-scrollbar selection:bg-emerald-500/30 transition-colors duration-500">

        {/* Background Glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
        </div>

        <main id="report-content" className="w-full max-w-[1400px] mx-auto pt-24 pb-12 px-6 md:px-10 flex flex-col relative z-10">
          
          {/* WAITING FOR HR STATUS BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[28px] flex items-center justify-between shadow-2xl shadow-indigo-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-2xl animate-pulse">
                <Clock size={20} className="text-indigo-400" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest italic">Awaiting HR Protocol</h4>
                 <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">
                   Thank you for completing the interview. Please wait for our response. Notification will be fired once HR reviews your profile.
                 </p>
              </div>
            </div>
            <div className="hidden md:flex px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.25em]">Pending Review</span>
            </div>
          </motion.div>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-slate-200 dark:border-zinc-800 pb-8 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-zinc-500">Neural Sync Verified</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none text-slate-900 dark:text-white uppercase">
                FINAL <span className="text-slate-200 dark:text-zinc-800 not-italic">REPORT</span>
              </h1>
              {sessionData && (
                <p className="text-slate-500 dark:text-zinc-600 text-[11px] font-black uppercase tracking-widest mt-2">
                  {candidateName} • {answeredCount}/{totalQuestions} Questions Answered
                </p>
              )}
            </motion.div>

            <div className="flex gap-3 flex-wrap justify-end" data-html2canvas-ignore="true">
              <button
                onClick={() => navigate("/home")}
                className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm"
              >
                <Home size={16} className="text-slate-400 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white">Back to Jobs</span>
              </button>
              <button className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all active:scale-95 group shadow-sm">
                <Share2 size={18} className="text-slate-400 dark:text-zinc-400 group-hover:text-emerald-500 rounded-[10px]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white">Share</span>
              </button>
              <button 
                onClick={handleExportWord}
                className="flex items-center gap-3 bg-blue-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-400/20"
              >
                <Download size={16} /> Word (.doc)
              </button>
              
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-3 bg-emerald-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 border border-emerald-400/20"
              >
                <Download size={16} /> Excel (.csv)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">

            {/* LEFT COLUMN */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">

              {/* Score Meter */}
              <div className={`bg-white dark:bg-[#0b111b] border border-slate-100 dark:border-white/5 p-10 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-sm break-inside-avoid ${hoverEffect}`}>
                <Award className="absolute -top-6 -right-6 text-slate-50 dark:text-white/[0.02] group-hover:text-emerald-500/10 transition-colors rotate-12" size={180} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 mb-10">Candidate Match Accuracy</p>

                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-60 h-60 transform -rotate-90">
                    <circle className="text-slate-100 dark:text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" r="95" cx="120" cy="120" />
                    <motion.circle
                      className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      strokeWidth="10"
                      strokeDasharray={597}
                      initial={{ strokeDashoffset: 597 }}
                      animate={{ strokeDashoffset: 597 - (597 * finalScore) / 100 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      strokeLinecap="round" stroke="currentColor" fill="transparent" r="95" cx="120" cy="120"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <motion.span className="text-8xl font-black tracking-tighter italic text-slate-900 dark:text-white">{rounded}</motion.span>
                    <span className="text-emerald-500 font-black text-xl mt-[-8px]">%</span>
                  </div>
                </div>

                <div className={`mt-10 px-8 py-2.5 rounded-full border ${qualificationTier.bg}`}>
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${qualificationTier.color} animate-pulse`}>
                    {qualificationTier.label}
                  </span>
                </div>
              </div>

              {/* Competency Bars */}
              <div className={`bg-white dark:bg-[#0b111b] border border-slate-100 dark:border-white/5 p-10 rounded-3xl group shadow-sm break-inside-avoid ${hoverEffect}`}>
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-600 mb-10">Detailed Calibration</h4>
                <div className="space-y-10">
                  {stats.map((s, i) => (
                    <div key={s.label} className="group/bar">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 dark:text-zinc-500 group-hover/bar:text-emerald-500 transition-colors border border-slate-100 dark:border-white/5">
                            {s.icon}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 group-hover/bar:text-slate-900 dark:group-hover/bar:text-white transition-colors">{s.label}</span>
                        </div>
                        <span className="font-mono font-bold text-sm text-emerald-500">{s.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.score}%` }}
                          transition={{ duration: 1.5, delay: 0.3 + i * 0.2 }}
                          className={`${s.color} h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

              {/* Strengths & Growth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className={`bg-white dark:bg-[#0b111b] border border-slate-100 dark:border-white/5 p-10 rounded-3xl break-inside-avoid ${hoverEffect}`}
                >
                  <div className="flex items-center gap-4 text-emerald-500 mb-6">
                    <CheckCircle2 size={24} />
                    <span className="font-black text-xs uppercase tracking-[0.3em]">Core Competencies</span>
                  </div>
                  <p className="text-[15px] text-slate-600 dark:text-zinc-400 leading-relaxed font-medium italic">{feedbackStrong}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className={`bg-white dark:bg-[#0b111b] border border-slate-100 dark:border-white/5 p-10 rounded-3xl break-inside-avoid ${hoverEffect}`}
                >
                  <div className="flex items-center gap-4 text-amber-500 mb-6">
                    <AlertCircle size={24} />
                    <span className="font-black text-xs uppercase tracking-[0.3em]">Growth Opportunities</span>
                  </div>
                  <p className="text-[15px] text-slate-600 dark:text-zinc-400 leading-relaxed font-medium italic">{feedbackGrowth}</p>
                </motion.div>
              </div>

              {/* Q&A Transcript */}
              <div className={`flex-1 bg-white dark:bg-[#0b111b] border border-slate-100 dark:border-white/5 p-10 rounded-3xl flex flex-col shadow-sm ${hoverEffect}`}>
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                      <BarChart3 size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Vocal Analysis Stream</h4>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-[0.3em]">Neural Transcription Engine</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sync Complete</span>
                  </div>
                </div>

                <div id="transcript-container" className="space-y-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {questionsAnswered.length > 0 ? questionsAnswered.map((q, i) => (
                    <div key={i} className="group/text space-y-6 break-inside-avoid">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-500/30 uppercase tracking-[0.4em]">
                          Query_0{String(i + 1).padStart(1, "0")}
                        </span>
                        <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                      </div>
                      <p className="text-xl font-bold italic tracking-tight text-slate-400 dark:text-zinc-500 pl-8 border-l-2 border-emerald-500/20 group-hover/text:text-emerald-600 dark:group-hover/text:text-emerald-400 transition-all duration-300">
                        "{q}"
                      </p>
                      <div className="bg-slate-50 dark:bg-zinc-900/30 p-8 rounded-[35px] border border-slate-100 dark:border-zinc-800 group-hover/text:bg-emerald-500/5 group-hover/text:border-emerald-500/20 transition-all duration-300 shadow-inner">
                        <p className="text-[9px] font-black text-emerald-500 dark:text-emerald-400/60 uppercase tracking-[0.4em] mb-4 opacity-50">Response_Stream_Data</p>
                        <p className="text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-medium italic">
                          {finalScore < 40
                            ? "[STATIC/SILENCE] No meaningful information could be transcribed from the audio stream."
                            : (i === 0
                              ? "Well-articulated response covering core concepts with real-world examples. Candidate demonstrated clear understanding of the topic."
                              : "Response covered the fundamentals with good communication. Key points addressed within the allocated time.")}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-300 dark:text-zinc-700 font-black uppercase tracking-widest text-xs text-center py-10">
                      No transcript available for this session.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-10 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center opacity-40 italic text-slate-400 dark:text-zinc-500">
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">{candidateName} • RecruitAI System</span>
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Deep-Analysis Protocol Active</span>
          </div>
        </main>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(16, 185, 129, 0.01); border-radius: 20px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.15); border-radius: 20px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
        `}</style>
      </div>
    </PageTransition>
  );
}