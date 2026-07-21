import React, { useState, useMemo, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { 
  Search, CheckCircle2, Clock, XCircle,
  Trash2, ChevronLeft, ChevronRight, Activity, 
  BrainCircuit, Filter, Download, ExternalLink,
  RefreshCcw, UserCheck
} from "lucide-react";
import Swal from "sweetalert2";

const STATUS_CONFIG = {
  Pending:     { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   icon: <Clock size={10} /> },
  Interviewed: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: <Activity size={10} /> },
  Selected:    { color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 size={10} /> },
  Rejected:    { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",     icon: <XCircle size={10} /> },
};

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const itemsPerPage = 6;

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/jobs/admin/applications");
      setCandidates(data.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // --- STATUS UPDATE ---
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await apiClient.patch(`/jobs/applications/${id}/status`, { status: newStatus });
      setCandidates(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'ERROR', text: 'Failed to update status.', icon: 'error', background: '#0b111b', color: '#fff' });
    } finally {
      setUpdatingId(null);
    }
  };

  // --- DELETE ---
  const handleDelete = (id) => {
    Swal.fire({
      title: "TERMINATE NODE?",
      text: "This action will purge candidate application from the system.",
      icon: "warning",
      showCancelButton: true,
      background: "#0b111b",
      color: "#fff",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "YES, PURGE",
      cancelButtonText: "ABORT",
      customClass: {
        popup: 'rounded-[24px] border border-zinc-800 shadow-2xl',
        title: 'italic font-black tracking-tighter'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/jobs/applications/${id}`);
          setCandidates(prev => prev.filter(c => c._id !== id));
          Swal.fire({
            title: "PURGED!",
            text: "Neural node has been disconnected.",
            icon: "success",
            background: "#0b111b",
            color: "#fff",
            confirmButtonColor: "#10b981",
          });
        } catch (err) {
          console.error(err);
          Swal.fire({ title: 'ERROR', text: 'Failed to delete application.', icon: 'error', background: '#0b111b', color: '#fff' });
        }
      }
    });
  };

  // --- FILTER LOGIC ---
  const filteredCandidates = useMemo(() => {
    let result = candidates;
    if (filterStatus !== "ALL") {
      result = result.filter(c => c.status === filterStatus);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.user?.name || '').toLowerCase().includes(term) || 
        (c.job?.title || '').toLowerCase().includes(term) ||
        (c._id || '').toLowerCase().includes(term)
      );
    }
    return result;
  }, [searchTerm, filterStatus, candidates]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const currentItems = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // --- COMPUTED STATS ---
  const stats = {
    total: candidates.length,
    selected: candidates.filter(c => c.status === 'Selected').length,
    pending: candidates.filter(c => c.status === 'Pending').length,
    avgScore: candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / candidates.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-500 dark:text-zinc-400 p-8 font-sans selection:bg-emerald-500/30">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          Neural Engine · Live Data
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
          NEURAL <span className="text-emerald-500">CANDIDATES</span>
        </h1>
        <p className="text-slate-400 dark:text-zinc-600 mt-2 text-[11px] italic font-black max-w-lg uppercase tracking-widest opacity-70">
          Manage and update candidate application statuses in real-time.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Applications", value: stats.total, color: "text-slate-900 dark:text-white", icon: <Activity size={18}/> },
          { label: "Selected Nodes",     value: stats.selected, color: "text-emerald-500 dark:text-emerald-400", icon: <CheckCircle2 size={18}/> },
          { label: "Pending Review",     value: stats.pending,  color: "text-blue-500 dark:text-blue-400",    icon: <Clock size={18}/> },
          { label: "Avg Neural Score",   value: `${stats.avgScore}%`, color: "text-yellow-400", icon: <BrainCircuit size={18}/> },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-3">
              <div className={`${s.color} opacity-20`}>{s.icon}</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className={`text-3xl font-black ${s.color}`}>{loading ? '...' : s.value}</h3>
          </div>
        ))}
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, job or ID..."
            className="w-full bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 py-4 pl-12 pr-4 rounded-2xl focus:border-emerald-500/50 outline-none transition text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-700 shadow-sm dark:shadow-none"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 outline-none focus:border-emerald-500/40 cursor-pointer shadow-sm dark:shadow-none"
        >
          <option value="ALL">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Interviewed">Interviewed</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button 
          onClick={fetchApplications}
          className="flex items-center gap-2 bg-white dark:bg-[#0b111b]/50 border border-slate-200 dark:border-zinc-800 px-6 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin text-emerald-500" : "text-emerald-500"} /> Refresh
        </button>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl transition text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95">
          <Download size={16} strokeWidth={3} /> Export Logs
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white dark:bg-[#0b111b]/30 border border-slate-200 dark:border-zinc-800 rounded-[32px] overflow-hidden backdrop-blur-md shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-black/40 border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Candidate Node</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-center">Target Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-center">Neural Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    <td className="px-8 py-6 text-center"><div className="h-4 bg-zinc-800 rounded w-24 mx-auto" /></td>
                    <td className="px-8 py-6 text-center"><div className="h-4 bg-zinc-800 rounded w-16 mx-auto" /></td>
                    <td className="px-8 py-6 text-center"><div className="h-4 bg-zinc-800 rounded w-20 mx-auto" /></td>
                    <td className="px-8 py-6" />
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <BrainCircuit className="mx-auto text-zinc-800 mb-4" size={40} />
                    <p className="text-zinc-700 font-black text-xs uppercase tracking-widest">No applications found in neural logs.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.Pending;
                  return (
                    <tr key={app._id} className="hover:bg-emerald-500/[0.02] transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-[10px] font-black text-emerald-500 group-hover:border-emerald-500/30 transition-all uppercase">
                            {(app.user?.name || 'NA').substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{app.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-zinc-600 font-mono tracking-tighter">{app.user?.email || app._id.substring(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-black text-zinc-500 italic text-center uppercase tracking-tighter">#{app.job?.title || 'N/A'}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs font-black text-emerald-500">{app.aiScore || 0}%</span>
                          <div className="w-16 h-1 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${app.aiScore || 0}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* STATUS DROPDOWN */}
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          {updatingId === app._id ? (
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              className={`text-[9px] font-black uppercase tracking-tighter border rounded-lg px-3 py-1.5 outline-none cursor-pointer transition-all appearance-none text-center ${cfg.color} ${cfg.bg}`}
                              style={{ backgroundColor: 'transparent' }}
                            >
                              <option value="Pending"     className="bg-zinc-900 text-white">Pending</option>
                              <option value="Interviewed" className="bg-zinc-900 text-white">Interviewed</option>
                              <option value="Selected"    className="bg-zinc-900 text-white">Selected</option>
                              <option value="Rejected"    className="bg-zinc-900 text-white">Rejected</option>
                            </select>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          {app.resumeUrl && (
                            <a
                              href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${app.resumeUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-zinc-700 hover:text-emerald-400 transition-colors hover:bg-emerald-500/10 rounded-lg"
                              title="View Resume"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                          <button 
                            onClick={() => handleDelete(app._id)}
                            className="p-2 text-zinc-700 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION & FOOTER */}
        <div className="p-6 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-zinc-700 uppercase tracking-widest italic">
            Showing {currentItems.length} of {filteredCandidates.length} applications
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">               <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-20 transition-all"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === i + 1 
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-900/20" 
                    : "bg-slate-100 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-20 transition-all"
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}