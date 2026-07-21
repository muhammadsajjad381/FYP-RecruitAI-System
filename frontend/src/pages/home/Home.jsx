import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { 
  Heart, ThumbsDown, Flag, MapPin, Clock, 
  Briefcase, Verified, ChevronDown, Filter, Search, Sparkles, X,
  ArrowRight, DollarSign 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";

// Dynamic jobs will be fetched from the backend

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromQuery = queryParams.get("tab");
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.tab || (tabFromQuery === 'applications' ? 'My Applications' : "Best Matches"));
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [hiddenJobIds, setHiddenJobIds] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "All",
    expertise: "All"
  });

  // --- Fetch Jobs & User Interactions ---
  const fetchData = async () => {
    try {
      const { data: jobsData } = await apiClient.get("/jobs");
      setJobs(jobsData.data);
      
      // Also fetch user details for interactions if logged in
      if (userInfo) {
        const { data: userData } = await apiClient.get("/auth/me");
        setSavedJobIds(userData.data.savedJobs || []);
        setHiddenJobIds(userData.data.hiddenJobs || []);
        
        try {
          const { data: appsData } = await apiClient.get("/jobs/my/applications");
          setMyApplications(appsData.data || []);
        } catch (appErr) {
          console.error("Failed to fetch applications:", appErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    } else if (tabFromQuery === 'applications') {
      setActiveTab("My Applications");
    }
  }, [location.state, tabFromQuery]);

  const handleSave = async (jobId) => {
    if (!userInfo) {
      Swal.fire({ title: 'AUTH REQUIRED', text: 'Please login to save protocols.', icon: 'warning', background: '#0b111b', color: '#fff' });
      return;
    }
    try {
      await apiClient.put(`/jobs/${jobId}/save`);
      setSavedJobIds(prev => {
        const isSaved = prev.some(id => id.toString() === jobId.toString());
        if (isSaved) {
          return prev.filter(id => id.toString() !== jobId.toString());
        } else {
          return [...prev, jobId];
        }
      });
    } catch (err) {
      console.error("Error saving job:", err);
      Swal.fire({ title: 'PROTOCOL ERROR', text: 'Failed to update neural save state.', icon: 'error', background: '#0b111b', color: '#fff' });
    }
  };

  const handleHide = async (jobId) => {
    if (!userInfo) {
      Swal.fire({ title: 'AUTH REQUIRED', text: 'Please login to hide protocols.', icon: 'warning', background: '#0b111b', color: '#fff' });
      return;
    }
    try {
      await apiClient.put(`/jobs/${jobId}/hide`);
      setHiddenJobIds(prev => [...prev, jobId]);
      Swal.fire({ title: 'PURGED', text: 'Job hidden from your feed.', icon: 'success', timer: 1500, showConfirmButton: false, background: '#0b111b', color: '#fff' });
    } catch (err) {
      console.error("Error hiding job:", err);
      Swal.fire({ title: 'ERROR', text: 'Failed to purge job from view.', icon: 'error', background: '#0b111b', color: '#fff' });
    }
  };
  
  // --- Filtering Logic ---
  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    
    // 1. Hide if in hiddenJobIds
    if (hiddenJobIds?.some(id => id?.toString() === job._id?.toString())) return false;

    // 2. Filter by search query
    const matchesSearch = job.title.toLowerCase().includes(query) || 
      (job.requirements && job.requirements.some(tag => tag.toLowerCase().includes(query)));

    // 3. Filter by Type and Expertise
    const matchesType = filters.type === "All" || job.type === filters.type;
    const matchesExpertise = filters.expertise === "All" || job.expertise === filters.expertise;

    // 4. Filter by Tab
    if (activeTab === "Saved") {
      return matchesSearch && matchesType && matchesExpertise && savedJobIds.some(id => id.toString() === job._id.toString());
    }
    
    return matchesSearch && matchesType && matchesExpertise;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Selected': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case 'Rejected': return "text-red-500 bg-red-500/10 border-red-500/20";
      case 'Interviewed': return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
      default: return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-600 dark:text-gray-200 font-sans selection:bg-indigo-500/30">
      <main className="max-w-[1200px] mx-auto pt-28 pb-10 px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
              Welcome back, <span className="text-indigo-600 dark:text-green-500">{userInfo?.name || "Guest"}</span>
            </h1>
            <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              Neural Matching Protocol Active
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-green-500 bg-indigo-50 dark:bg-green-500/5 w-fit px-5 py-2 rounded-2xl border border-indigo-100 dark:border-green-500/20 shadow-sm transition-all">
            <Sparkles size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">AI-Powered Job Matching Active</span>
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-4 gap-3 mb-10">
          <div className="md:col-span-3 relative w-full order-1 md:order-none group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for jobs (e.g. React, AI Engineer...)"
              className="w-full bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-gray-800 py-4 pl-14 pr-6 rounded-2xl focus:border-indigo-600 dark:focus:border-green-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600 text-sm text-slate-900 dark:text-white shadow-sm hover:border-slate-300"
            />
          </div>

          <div className="relative w-full">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-between bg-white dark:bg-[#0b111b] border ${showFilters ? 'border-indigo-600 dark:border-green-500' : 'border-slate-200 dark:border-gray-800'} rounded-2xl px-6 py-4 hover:border-indigo-600 dark:hover:border-gray-600 transition order-2 md:order-none w-full shadow-sm text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px]`}
            >
              <span className="flex items-center gap-2">
                <Filter size={16} className="text-indigo-600 dark:text-green-500" /> Filters
              </span>
              <ChevronDown size={14} className={`text-slate-400 dark:text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* FILTERS DROPDOWN */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-[24px] shadow-2xl p-6 z-[60]"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3 block">Job Type</label>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Full-time", "Part-time", "Remote", "Contract"].map(t => (
                          <button 
                            key={t} onClick={() => setFilters({...filters, type: t})}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${filters.type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-slate-200'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3 block">Expertise</label>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Entry", "Intermediate", "Expert"].map(e => (
                          <button 
                            key={e} onClick={() => setFilters({...filters, expertise: e})}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${filters.expertise === e ? 'bg-green-500 text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-slate-200'}`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => { setFilters({type: "All", expertise: "All"}); setShowFilters(false); }}
                      className="w-full py-3 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-slate-200 dark:border-gray-800">
          <div className="flex gap-10">
            {["Best Matches", "Most Recent", "Saved", "My Applications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-5 text-[11px] font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? "text-indigo-600 dark:text-white" : "text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-gray-300"
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 dark:bg-green-500 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Synchronizing...</p>
            </div>
          ) : activeTab === "My Applications" ? (
             myApplications.length > 0 ? (
               myApplications.map((app) => (
                 <motion.div 
                   key={app._id} 
                   className="bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-zinc-800/60 rounded-2xl p-6 hover:border-indigo-500/30 transition-all shadow-sm dark:shadow-2xl"
                 >
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-2">
                         {app.job?.title || "Unknown Position"}
                       </h2>
                       <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
                         Applied: {new Date(app.createdAt).toLocaleDateString()}
                       </p>
                     </div>
                     <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                       {app.status === 'Interviewed' ? 'Shortlisted' : app.status}
                     </div>
                   </div>

                   <p className="text-sm font-bold text-slate-600 dark:text-zinc-400 mb-6 italic">
                     Neural Synergy Score: <span className="text-emerald-500 font-black">{app.aiScore}%</span>
                   </p>

                   {app.status === 'Interviewed' ? (
                     <div className="pt-5 border-t border-slate-100 dark:border-zinc-800/30">
                       <div className="flex flex-col mb-4">
                          <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Sparkles size={12}/> Admin Authorized
                          </span>
                          <span className="text-slate-500 dark:text-zinc-400 text-xs italic">
                            Your resume has been reviewed and you are shortlisted. Please proceed to the AI verification interview.
                          </span>
                          {app.interviewDeadline && (
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${new Date() > new Date(app.interviewDeadline) ? 'text-red-500' : 'text-yellow-500'}`}>
                              Deadline: {new Date(app.interviewDeadline).toLocaleDateString()}
                            </span>
                          )}
                       </div>
                       {app.interviewDeadline && new Date() > new Date(app.interviewDeadline) ? (
                         <div className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-black py-4 rounded-xl text-center uppercase tracking-widest text-[11px]">
                           Deadline Passed - Interview Locked
                         </div>
                       ) : (
                         <button 
                           onClick={() => navigate("/voicesample", { state: { applicationId: app._id } })}
                           className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-[11px] flex justify-center items-center gap-2"
                         >
                           Start Voice Sample & Interview <ArrowRight size={16}/>
                         </button>
                       )}
                     </div>
                   ) : (
                     <div className="pt-5 border-t border-slate-100 dark:border-zinc-800/30">
                       <p className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-widest font-bold text-center">
                         {app.status === 'Pending' ? "Awaiting HR / Admin Review before Interview Phase." : "Status Finalized. Cannot proceed to Interview Phase."}
                       </p>
                     </div>
                   )}
                 </motion.div>
               ))
             ) : (
               <div className="col-span-full py-28 text-center bg-white dark:bg-[#0b111b]/40 rounded-[40px] border border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                 <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-full mb-6 text-slate-300 dark:text-zinc-700">
                   <Briefcase size={40} />
                 </div>
                 <p className="text-slate-900 dark:text-white font-black uppercase tracking-[0.4em] italic text-[11px] mb-2">No Applications Found</p>
               </div>
             )
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <motion.div 
                key={job._id} 
                className="bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-zinc-800/60 rounded-2xl p-5 md:p-6 hover:border-emerald-500/20 active:scale-[0.99] transition-all duration-300 group flex flex-col justify-between shadow-sm dark:shadow-2xl"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-600 text-[9px] font-black uppercase tracking-widest opacity-80">
                      <Clock size={11} className="text-indigo-600 dark:text-emerald-500" /> {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleHide(job._id); }} className="text-slate-300 dark:text-zinc-700 hover:text-red-500 transition-colors"><ThumbsDown size={15} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleSave(job._id); }} className={`transition-colors ${savedJobIds.some(id => id.toString() === job._id.toString()) ? "text-emerald-500" : "text-slate-300 dark:text-zinc-700 hover:text-emerald-500"}`}><Heart size={15} fill={savedJobIds.some(id => id.toString() === job._id.toString()) ? "currentColor" : "none"} /></button>
                    </div>
                  </div>

                  <h2 onClick={() => setSelectedJob(job)} className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-3 uppercase italic tracking-tight cursor-pointer hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h2>

                  <div className="flex items-center gap-3 mb-4 bg-slate-50 dark:bg-[#121926]/60 w-fit px-4 py-2 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                    <span className="text-slate-900 dark:text-white font-black text-[11px] tracking-tight">{job.salary}</span>
                    <div className="w-[1px] h-2.5 bg-slate-200 dark:bg-zinc-700" />
                    <span className="text-slate-500 dark:text-zinc-400 font-bold text-[8px] uppercase tracking-tighter">{job.expertise}</span>
                    <div className="w-[1px] h-2.5 bg-slate-200 dark:bg-zinc-700" />
                    <span className="text-slate-400 dark:text-zinc-500 font-bold text-[8px] uppercase tracking-tighter">{job.proposalsRange}</span>
                  </div>

                  <p className="text-slate-500 dark:text-zinc-500 text-[11px] leading-snug italic mb-4 line-clamp-2">
                    "{job.description}"
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.requirements && job.requirements.length > 0 ? job.requirements : ['REACT', 'NODE.JS', 'AI']).map((tag) => (
                      <span key={tag} className="text-[8px] font-black text-slate-500 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-zinc-800/30">
                  <div className="space-y-0">
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                      <Verified size={12} className="fill-emerald-500/5" /> Verified
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-600 text-[8px] font-bold uppercase tracking-widest italic leading-none">
                      <MapPin size={9} /> {job.location}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="bg-indigo-600 dark:bg-[#10b981] hover:bg-indigo-700 dark:hover:bg-[#059669] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 dark:shadow-emerald-900/10 active:scale-95 transition-all outline-none"
                  >
                    APPLY NOW
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-28 text-center bg-white dark:bg-[#0b111b]/40 rounded-[40px] border border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center shadow-sm">
               <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-full mb-6">
                 <Briefcase size={40} className="text-slate-300 dark:text-zinc-700" />
               </div>
               <p className="text-slate-900 dark:text-white font-black uppercase tracking-[0.4em] italic text-[11px] mb-2">No active protocols detected.</p>
               <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Awaiting system deployment synchronization...</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 -z-10 bg-[#00050d]/80"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white dark:bg-[#0b111b] border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] dark:shadow-[0_40px_100px_rgba(16,185,129,0.1)]"
            >
              {/* HEADER DECORATION */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em]">Protocol Synchronized</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-none uppercase italic tracking-tighter">
                        {selectedJob.title}
                      </h2>
                   </div>
                   <button 
                    onClick={() => setSelectedJob(null)}
                    className="group p-3 bg-slate-50 dark:bg-white/5 hover:bg-red-500/20 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 transition-all duration-300"
                  >
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-[20px] border border-slate-100 dark:border-white/5 transition-all hover:bg-indigo-500/5 hover:border-indigo-500/20 group">
                    <p className="text-[7px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Neural Compensation</p>
                    <p className="text-slate-900 dark:text-white font-black text-lg italic tracking-tighter leading-none">{selectedJob.salary}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-[20px] border border-slate-100 dark:border-white/5 transition-all hover:bg-emerald-500/5 hover:border-emerald-500/20 group">
                    <p className="text-[7px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Assignment Mode</p>
                    <p className="text-slate-900 dark:text-white font-black text-lg italic tracking-tighter leading-none">{selectedJob.type}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-[20px] border border-slate-100 dark:border-white/5 transition-all hover:bg-indigo-500/5 hover:border-indigo-500/20 group">
                    <p className="text-[7px] text-slate-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Geo Coordinates</p>
                    <p className="text-slate-900 dark:text-white font-black text-lg italic tracking-tighter leading-none">{selectedJob.location}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.3em]">Operational Directives</h3>
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/5 mx-4" />
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-indigo-500/0 rounded-[28px] blur opacity-0 group-hover:opacity-100 transition-all" />
                    <div className="relative bg-slate-50/50 dark:bg-white/5 p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-inner">
                      <p className="text-slate-600 dark:text-gray-400 text-[13px] leading-relaxed italic font-medium whitespace-pre-wrap">
                        {selectedJob.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(selectedJob.requirements || []).map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3.5 py-2 rounded-xl uppercase tracking-widest hover:border-emerald-500/40 hover:text-emerald-500 transition-all cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      navigate("/apply", { state: { jobId: selectedJob._id } });
                      setSelectedJob(null);
                    }}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-[20px] transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] active:scale-[0.98] uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
                  >
                    Initialize Application Protocol <ArrowRight size={16} strokeWidth={3}/>
                  </button>
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 text-slate-500 dark:text-gray-400 hover:text-red-500 font-bold rounded-[20px] transition-all uppercase text-[9px] tracking-widest border border-slate-200 dark:border-white/10"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}