import React, { useState, useMemo, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { 
  FileText, Search, 
  RefreshCcw, FileSpreadsheet,
  CheckCircle2, Clock, 
  PieChart as PieIcon, TrendingUp, 
  BrainCircuit
} from "lucide-react";
import { 
  CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, XAxis, YAxis, Area, AreaChart
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Colors for status
const STATUS_COLORS = {
  Pending:     "#6366f1", // Indigo
  Interviewed: "#f59e0b", // Amber
  Selected:    "#10b981", // Emerald
  Rejected:    "#ef4444", // Rose
};

export default function Reports() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/jobs/admin/applications");
      setApplications(data.data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const pieData = useMemo(() => {
    const counts = { Pending: 0, Interviewed: 0, Selected: 0, Rejected: 0 };
    applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
    return Object.entries(counts)
      .filter(([, val]) => val > 0)
      .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] }));
  }, [applications]);

  const avgScore = useMemo(() => {
    if (!applications.length) return 0;
    return Math.round(applications.reduce((s, a) => s + (a.aiScore || 0), 0) / applications.length);
  }, [applications]);

  const trendData = useMemo(() => {
    const monthly = {};
    applications.forEach(app => {
      const date = new Date(app.createdAt || app.appliedAt);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthly[key]) monthly[key] = { month: key, applications: 0, avgScore: 0, scores: [] };
      monthly[key].applications++;
      monthly[key].scores.push(app.aiScore || 0);
    });
    return Object.values(monthly).map(m => ({
      ...m,
      avgScore: m.scores.length ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : 0,
    })).slice(-6);
  }, [applications]);

  const filteredLogs = useMemo(() => {
    return applications.filter(app => {
      const name = app.user?.name || '';
      const title = app.job?.title || '';
      const id = app._id || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) 
        || title.toLowerCase().includes(searchTerm.toLowerCase())
        || id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, applications]);

  const handleExport = () => {
    setIsExporting(true);
    const headers = ['ID', 'Candidate', 'Email', 'Job', 'Score', 'Status', 'Applied At'];
    const rows = applications.map(a => [
      a._id,
      a.user?.name || 'N/A',
      a.user?.email || 'N/A',
      a.job?.title || 'N/A',
      a.aiScore || 0,
      a.status,
      new Date(a.createdAt || a.appliedAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitai_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#00050d] text-slate-600 dark:text-zinc-400 font-sans selection:bg-indigo-500/30 p-6 lg:p-10">
      <div className="relative z-10 max-w-[1600px] mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 border-b border-slate-200 dark:border-zinc-900 pb-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
              Neural <span className="text-indigo-600 dark:text-green-500">Reports</span>
            </h1>
            <p className="text-slate-500 dark:text-zinc-500 text-sm font-black italic max-w-md uppercase tracking-wider">
              Real-time recruitment analytics and candidate performance metrics.
            </p>
            {!loading && (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                {applications.length} records loaded · Last refreshed now
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={fetchApplications}
              className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin text-indigo-600 dark:text-emerald-500" : ""} /> Refresh
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-4 px-10 py-4 bg-indigo-600 dark:bg-emerald-500 hover:bg-indigo-700 dark:hover:bg-emerald-400 text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              {isExporting ? <RefreshCcw className="animate-spin" size={16} /> : <FileSpreadsheet size={18} />}
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Applications", val: applications.length,                                       color: "text-slate-900 dark:text-white",         icon: <FileText size={18}/> },
            { label: "Selected Candidates",val: applications.filter(a => a.status === 'Selected').length,  color: "text-indigo-600 dark:text-emerald-400",   icon: <CheckCircle2 size={18}/> },
            { label: "Pending Review",     val: applications.filter(a => a.status === 'Pending').length,   color: "text-blue-500 dark:text-blue-400",      icon: <Clock size={18}/> },
            { label: "Avg Neural Score",   val: `${avgScore}%`,                                            color: "text-amber-500 dark:text-yellow-400",    icon: <BrainCircuit size={18}/> },
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 p-6 rounded-[32px] shadow-sm dark:shadow-xl group hover:border-indigo-500/30 transition-all">
              <div className={`${kpi.color} opacity-40 mb-4 group-hover:scale-110 transition-transform`}>{kpi.icon}</div>
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h3 className={`text-4xl font-black italic tracking-tighter ${kpi.color}`}>
                {loading ? <span className="animate-pulse opacity-20">...</span> : kpi.val}
              </h3>
            </div>
          ))}
        </div>

        {/* ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Pie Distribution */}
          <div className="bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 rounded-[40px] p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-600 dark:text-white">
              <PieIcon size={80} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-emerald-500" /> Status Distribution
            </h3>
            {loading ? (
              <div className="h-[280px] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-indigo-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pieData.length > 0 ? (
              <>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData} 
                        innerRadius={65} 
                        outerRadius={95} 
                        paddingAngle={8} 
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-900 group/item hover:border-indigo-500/20 transition-all">
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-500">{item.name}</span>
                      <span className="text-[11px] font-black text-slate-900 dark:text-zinc-400 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-300 dark:text-zinc-700 text-xs font-black uppercase">No data yet</div>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="xl:col-span-2 bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 rounded-[40px] p-8 shadow-sm dark:shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                  <TrendingUp size={14} className="text-indigo-600 dark:text-emerald-500" /> Application Velocity
                </h3>
                <p className="text-3xl font-black italic text-slate-900 dark:text-white mt-1 uppercase tracking-tighter">
                  {trendData.length > 0 ? trendData[trendData.length - 1]?.applications : 0}
                  <span className="text-[10px] text-indigo-600 dark:text-emerald-500 not-italic tracking-[0.2em] ml-3 uppercase font-black">This Month</span>
                </p>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-indigo-600 dark:border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="appGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke="#94a3b8" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: '900' }} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '11px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} 
                      itemStyle={{color: '#fff', fontWeight: '900', textTransform: 'uppercase'}}
                    />
                    <Area type="monotone" dataKey="applications" stroke="#4f46e5" strokeWidth={4} fill="url(#appGlow)" name="Applications" />
                    <Area type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 6" fill="url(#scoreGlow)" name="Avg Score %" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 dark:text-zinc-700 text-xs font-black uppercase">No trend data yet</div>
              )}
            </div>
            <div className="flex gap-10 mt-6 pt-8 border-t border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-5 h-1.5 rounded-full bg-indigo-600 dark:bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest leading-none">Applications</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest leading-none">Avg Score %</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED TABLE */}
        <div className="bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 rounded-[40px] overflow-hidden shadow-sm dark:shadow-2xl">
          {/* Toolbar */}
          <div className="p-8 border-b border-slate-100 dark:border-zinc-900 bg-slate-50/[0.3] dark:bg-white/[0.01] flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-700 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search candidate or job protocol..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 rounded-2xl py-4 pl-14 pr-6 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-emerald-500/40 transition-all placeholder:text-slate-200 dark:placeholder:text-zinc-800 shadow-inner"
                />
              </div>
              <div className="relative">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white dark:bg-[#00050d] border border-slate-200 dark:border-zinc-900 rounded-2xl px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 outline-none focus:border-indigo-600 dark:focus:border-emerald-500/40 cursor-pointer appearance-none shadow-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-700 uppercase tracking-[0.2em] italic">
              {filteredLogs.length} Records Detected
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-[#00050d] text-slate-400 dark:text-zinc-600 border-b border-slate-100 dark:border-zinc-900">
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em]">Ref ID</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em]">Candidate</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em]">Job Role</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-center">Neural Score</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-center">Applied Date</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                <AnimatePresence>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="p-8"><div className="h-4 bg-slate-100 dark:bg-zinc-900 rounded-full w-24" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <BrainCircuit className="mx-auto text-slate-100 dark:text-zinc-900 mb-6" size={50} />
                        <p className="text-slate-300 dark:text-zinc-700 font-black text-[11px] uppercase tracking-[0.4em] italic">No matching records found</p>
                      </td>
                    </tr>
                  ) : filteredLogs.map((app, i) => {
                    const statusColor = {
                      Selected:    'bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 border-emerald-500/10',
                      Pending:     'bg-indigo-500/5 text-indigo-600 dark:text-blue-400 border-indigo-500/10',
                      Interviewed: 'bg-amber-500/5 text-amber-600 dark:text-amber-500 border-amber-500/10',
                      Rejected:    'bg-red-500/5 text-red-600 dark:text-red-500 border-red-500/10',
                    }[app.status] || 'bg-slate-500/5 text-slate-400 border-slate-500/10';

                    return (
                      <motion.tr 
                        key={app._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="group hover:bg-indigo-50/30 dark:hover:bg-white/[0.01] transition-all"
                      >
                        <td className="p-8">
                          <span className="font-mono text-[10px] font-black text-slate-400 dark:text-zinc-600">{app._id.substring(0, 8).toUpperCase()}</span>
                        </td>
                        <td className="p-8">
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{app.user?.name || 'Unknown User'}</p>
                            <p className="text-[9px] text-slate-400 dark:text-zinc-600 font-mono font-bold mt-0.5">{app.user?.email}</p>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className="text-xs font-black text-slate-500 dark:text-zinc-400 uppercase italic tracking-tight">{app.job?.title || 'N/A'}</span>
                        </td>
                        <td className="p-8 text-center">
                          <span className={`text-xl font-black italic ${(app.aiScore || 0) >= 80 ? 'text-indigo-600 dark:text-emerald-400' : (app.aiScore || 0) >= 60 ? 'text-amber-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                            {app.aiScore || 0}%
                          </span>
                        </td>
                        <td className="p-8 text-center">
                          <span className="text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                            {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-8">
                          <div className="flex justify-center">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-dashed ${statusColor} shadow-sm`}>
                              {app.status === 'Selected' ? <CheckCircle2 size={12} strokeWidth={3} /> : <Clock size={12} strokeWidth={3} />}
                              {app.status}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}