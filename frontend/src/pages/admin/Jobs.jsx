import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit, Trash2, Search, 
  CheckCircle, XCircle, Users, Briefcase, Clock,
  Cpu, Activity, ShieldCheck, X
} from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "../../api/apiClient";
import { useEffect } from "react";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company: "RecruitAI",
    location: "Remote",
    salary: "",
    description: "",
    type: "Full-time",
    expertise: "Intermediate",
    proposalsRange: "Proposals: 0 to 5",
    requirements: "",
    status: "Active"
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/jobs/admin/all");
      setJobs(data.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        requirements: typeof formData.requirements === 'string' 
          ? formData.requirements.split(',').map(s => s.trim()).filter(s => s !== '')
          : formData.requirements
      };

      if (editingId) {
        await apiClient.put(`/jobs/${editingId}`, jobData);
        Swal.fire({ title: 'PROTOCOL UPDATED!', icon: 'success', background: '#0b111b', color: '#fff', confirmButtonColor: '#10b981' });
      } else {
        await apiClient.post("/jobs", jobData);
        Swal.fire({ title: 'PROTOCOL DEPLOYED!', icon: 'success', background: '#0b111b', color: '#fff', confirmButtonColor: '#10b981' });
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ 
        title: "", company: "RecruitAI", location: "Remote", salary: "", 
        description: "", type: "Full-time", expertise: "Intermediate", 
        proposalsRange: "Proposals: 0 to 5", requirements: "",
        status: "Active"
      });
      fetchJobs();
    } catch (err) {
      console.error("Job Protocol Error:", err);
      const errorMsg = err.response?.data?.message || 'Protocol operation failed! Please check system logs.';
      Swal.fire({ 
        title: 'DEPLOYMENT FAILED', 
        text: errorMsg, 
        icon: 'error', 
        background: '#0b111b', 
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // --- Search Logic ---
  const filteredJobs = jobs.filter((job) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ALERTS & ACTIONS ---
  const handleToggleStatus = async (job) => {
    const newStatus = (job.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    try {
      await apiClient.put(`/jobs/${job._id}`, { status: newStatus });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const confirmDelete = async (id) => {
    Swal.fire({
      title: 'TERMINATE PROTOCOL?',
      text: "This job protocol will be purged from neural logs permanently!",
      icon: 'warning',
      showCancelButton: true,
      background: '#0b111b',
      color: '#fff',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'YES, PURGE',
      cancelButtonText: 'ABORT'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/jobs/${id}`); // Assuming delete route exists
          setJobs(jobs.filter(j => j._id !== id));
          Swal.fire({ title: 'PURGED!', icon: 'success', background: '#0b111b', color: '#fff', confirmButtonColor: '#10b981' });
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="p-8 bg-[#f8fafc] dark:bg-[#00050d] min-h-screen text-slate-500 dark:text-zinc-400 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            Recruitment Core
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
            JOB <span className="text-emerald-500">INVENTORY</span>
          </h1>
          <p className="text-zinc-600 text-[11px] font-black uppercase tracking-widest italic opacity-70 mt-1">
            Deploy and monitor active neural recruitment protocols.
          </p>
        </div>
        
        <button 
          onClick={() => { setIsModalOpen(true); }}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <Plus size={16} strokeWidth={3} /> Create New Protocol
        </button>
      </div>

      {/* SEARCH & STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search protocols..." 
            value={searchTerm} // 2. Bind Value
            onChange={(e) => setSearchTerm(e.target.value)} // 3. Update State
            className="w-full bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-500/50 outline-none transition-all text-sm uppercase font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-800 shadow-sm dark:shadow-none"
          />
        </div>
        <div className="bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 p-4 px-6 rounded-2xl flex items-center justify-between backdrop-blur-sm shadow-sm dark:shadow-none">
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest italic">Active Jobs</span>
          <span className="text-xl font-black text-emerald-500 tracking-tighter">{jobs.filter(j => (j.status || 'Active') === 'Active').length}</span>
        </div>
        <div className="bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 p-4 px-6 rounded-2xl flex items-center justify-between backdrop-blur-sm shadow-sm dark:shadow-none">
          <span className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest italic">Total Talent</span>
          <span className="text-xl font-black text-blue-500 tracking-tighter">1.2K</span>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white dark:bg-[#0b111b]/30 border border-slate-200 dark:border-zinc-800 rounded-[32px] overflow-hidden backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-black/40">
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-[0.2em]">Job Protocol</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-[0.2em]">Department</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-[0.2em] text-center">Applicants</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-[0.2em] text-center">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={job._id} 
                  className="hover:bg-emerald-500/[0.02] border-b border-slate-50 dark:border-zinc-800/50 transition-all group"
                >
                  <td className="p-6">
                    <div className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{job.title}</div>
                    <div className="text-[9px] text-slate-400 dark:text-zinc-600 mt-1 font-black italic uppercase tracking-tighter opacity-60">
                      ID: {job._id.substring(0, 8).toUpperCase()} • {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-lg text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-tighter">
                      {job.company}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 font-black text-blue-400 text-xs tracking-tighter">
                      <Briefcase size={14} /> {job.type}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => handleToggleStatus(job)}
                      className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] transition-all cursor-pointer ${
                        (job.status || 'Active') === 'Active' 
                        ? 'text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10' 
                        : 'text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800'
                      }`}
                    >
                      {(job.status || 'Active') === 'Active' ? <CheckCircle size={14} className="fill-emerald-500/10" /> : <XCircle size={14} />}
                      {job.status || 'Active'}
                    </button>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingId(job._id);
                          setFormData({
                            title: job.title,
                            company: job.company,
                            location: job.location,
                            salary: job.salary,
                            description: job.description,
                            type: job.type,
                            expertise: job.expertise || "Intermediate",
                            proposalsRange: job.proposalsRange || "Proposals: 0 to 5",
                            requirements: job.requirements ? job.requirements.join(', ') : "",
                            status: job.status || "Active"
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-300 dark:text-zinc-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-inner"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(job._id)}
                        className="p-2 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-xl text-slate-300 dark:text-zinc-700 hover:text-red-600 dark:hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan="5" className="p-20 text-center text-zinc-700 font-black uppercase tracking-widest italic opacity-50">
                  No Protocols Match Your Search Query
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#0b111b] border-2 border-emerald-500/20 w-full max-w-4xl rounded-[24px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
            >
              <div className="h-auto max-h-[90vh] overflow-y-auto">
                {/* Form Content */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                        {editingId ? 'Update' : 'Deploy'} <span className="text-emerald-500">Neural Opening</span>
                      </h2>
                      <p className="text-slate-400 dark:text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-0.5">Initialize Professional Recruitment Protocol</p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-all border border-slate-100 dark:border-zinc-800"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateJob} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Protocol Name</label>
                        <input 
                          type="text" required 
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-xs uppercase tracking-tight transition-all" 
                          placeholder="e.g. SENIOR AI ENGINEER" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Budget Allocation</label>
                        <input 
                          type="text" required
                          value={formData.salary}
                          onChange={(e) => setFormData({...formData, salary: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-xs transition-all" 
                          placeholder="e.g. $1,200 - $3,000" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Job Type</label>
                        <select 
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px] uppercase transition-all"
                        >
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Remote</option>
                          <option>Contract</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Expertise</label>
                        <select 
                          value={formData.expertise}
                          onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px] uppercase transition-all"
                        >
                          <option value="Entry">Entry Level</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Location</label>
                        <input 
                          type="text" required
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px] uppercase" 
                          placeholder="e.g. UNITED STATES" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Proposals Range</label>
                        <input 
                          type="text" required
                          value={formData.proposalsRange}
                          onChange={(e) => setFormData({...formData, proposalsRange: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px]" 
                          placeholder="Proposals: 0 to 5" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Requirements (Tags)</label>
                        <input 
                          type="text"
                          value={formData.requirements}
                          onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white font-black text-[10px]" 
                          placeholder="React, Node.js" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] ml-1">Technical Briefing</label>
                      <textarea 
                        required rows="2"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-[#121926]/50 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 focus:border-emerald-500/50 outline-none text-slate-900 dark:text-white text-[11px] leading-relaxed italic transition-all shadow-inner font-medium" 
                        placeholder="Detail the technical neural requirements..." 
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="flex-1 py-3.5 border border-slate-200 dark:border-zinc-800 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all hover:text-slate-900 dark:hover:text-white">Abort</button>
                      <button type="submit" className="flex-1 py-3.5 bg-emerald-500 text-black rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-emerald-400 transition-all active:scale-95">
                        {editingId ? 'Confirm' : 'Deploy'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;